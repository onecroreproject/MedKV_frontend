import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PreJoinScreen from './components/PreJoinScreen';
import WaitingRoom from './components/WaitingRoom';
import ClassroomPage from '../classroom-preview/ClassroomPage';
import ZoomClassroom from '../classroom/components/ZoomClassroom';
import { getMe } from '../../services/userService'; 
import { getLiveClass } from '../../services/liveClassService';
import { admissionService } from '../../services/admissionService';

export default function ClassroomEntryPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [entryState, setEntryState] = useState('PRE_JOIN'); 
  const [user, setUser] = useState(null);
  const [liveClass, setLiveClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Hydrate token from URL param (_t) when coming from Admin Panel cross-origin redirect
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('_t');
        if (urlToken) {
          localStorage.setItem('token', urlToken);
          // Clean up token from URL to avoid sharing/bookmarking issues
          const cleanUrl = `${window.location.pathname}`;
          window.history.replaceState({}, '', cleanUrl);
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/student/login');
          return;
        }
        const res = await getMe();
        if (res && res.data) {
          setUser(res.data);
          
          // Fetch LiveClass details to determine meetingProvider
          try {
            const classRes = await getLiveClass(roomId);
            if (classRes && classRes.data) {
              setLiveClass(classRes.data);
            } else {
              setErrorMsg("Class not found.");
            }
          } catch (err) {
            setErrorMsg("Error fetching class details.");
          }
          
        } else {
          navigate('/student/login');
        }
      } catch (error) {
        navigate('/student/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [navigate, location.search]);

  useEffect(() => {
    if (user && liveClass && liveClass.meetingProvider !== 'zoom') {
      admissionService.connect();

      admissionService.onAdmitted = () => {
        setEntryState('ADMITTED');
        setTimeout(() => {
          setEntryState('CLASSROOM');
        }, 500);
      };

      admissionService.onRejected = (data) => {
        alert(data.message || 'Your request to join was rejected.');
        setEntryState('PRE_JOIN');
      };

      admissionService.onWaitingRoomJoined = () => {
        setEntryState('WAITING');
      };

      return () => {
        // Disconnect if we navigate away entirely
        admissionService.disconnect();
      };
    }
  }, [user, liveClass]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const handleJoinPreJoin = () => {
    setErrorMsg(null);
    admissionService.requestJoin(roomId);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSimulateAdmit = () => {
    setEntryState('ADMITTED');
    setTimeout(() => {
      setEntryState('CLASSROOM');
    }, 500);
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p>{errorMsg}</p>
        <button onClick={handleCancel} className="mt-6 px-4 py-2 bg-blue-600 rounded">Go Back</button>
      </div>
    );
  }

  // Zoom meetings bypass the WebRTC pre-join screen and waiting room,
  // as the Zoom SDK handles its own device checks and waiting rooms natively.
  if (liveClass && liveClass.meetingProvider === 'zoom') {
    return (
      <div className="w-full h-screen overflow-hidden bg-black flex flex-col">
        <ZoomClassroom liveClassId={roomId} user={user} />
      </div>
    );
  }

  if (entryState === 'PRE_JOIN') {
    return (
      <PreJoinScreen 
        user={user}
        roomTitle={`Room: ${roomId}`}
        onJoin={handleJoinPreJoin}
        onCancel={handleCancel}
      />
    );
  }

  if (entryState === 'WAITING' || entryState === 'ADMITTED') {
    return (
      <div className={`transition-opacity duration-500 ${entryState === 'ADMITTED' ? 'opacity-0' : 'opacity-100'}`}>
        <WaitingRoom 
          onLeave={handleCancel}
          onSimulateAdmit={handleSimulateAdmit}
        />
      </div>
    );
  }

  if (entryState === 'CLASSROOM') {
    // Pass admissionService and user to ClassroomPage for faculty management
    return <ClassroomPage admissionService={admissionService} user={user} />;
  }

  return null;
}
