import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PreJoinScreen from './components/PreJoinScreen';
import WaitingRoom from './components/WaitingRoom';
import ClassroomPage from '../classroom-preview/ClassroomPage';
// ZoomClassroom embedded component removed per user request
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

  // Zoom meetings bypass the WebRTC pre-join screen and waiting room.
  // Instead, redirect the user directly to the native Zoom application.
  if (liveClass && liveClass.meetingProvider === 'zoom') {
    const isAdmin = user?.role === 'Admin';
    
    const handleZoomRedirect = () => {
      const token = localStorage.getItem('token');
      const action = isAdmin ? 'start' : 'join';
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.drsamreefathradiologyacademy.com/api/v1';
      window.location.href = `${apiUrl}/zoom/${action}/${roomId}?token=${token}`;
    };

    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{liveClass.title || 'Live Class'}</h2>
          <p className="text-blue-400 font-medium mb-6">Radiology Class</p>
          
          <div className="bg-slate-800/50 rounded-lg p-4 mb-8 text-left space-y-3 border border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Provider</span>
              <span className="text-white font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Zoom
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="text-white font-medium flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${liveClass.status === 'Completed' ? 'bg-slate-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                {liveClass.status || 'Live'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleZoomRedirect}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            {isAdmin ? 'Connect to Zoom' : 'Join Zoom Class'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </button>
          
          <p className="text-slate-500 text-sm mt-6">
            Clicking this button will securely connect you to the Zoom application.
          </p>
        </div>
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
