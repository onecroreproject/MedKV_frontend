import re

def main():
    # Update ClassroomPage.jsx
    file_path = r'r:\ClientProject\MediacalKV\fe\src\pages\classroom-preview\ClassroomPage.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    handleToggleRecording_replacement = """const handleToggleRecording = async () => {
    if (userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'Faculty') return;
    
    console.log('[Recording][UI] ================================');
    console.log('[Recording][UI] Record button clicked');
    console.log('[Recording][UI] Room ID:', roomId);
    console.log('[Recording][UI] User ID:', user?._id || user?.id);
    console.log('[Recording][UI] User Role:', userRole);
    console.log('[Recording][UI] Current State:', recordingState);
    console.log('[Recording][UI] Time:', new Date().toISOString());

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    try {
      let res;
      if (recordingState === 'recording' || recordingState === 'paused') {
        // Stop recording
        console.log('[Recording][API] STOP request');
        console.log('[Recording][API] Room ID:', roomId);
        res = await fetch(`${apiUrl}/class-recordings/stop`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
        
        console.log('[Recording][API] STOP response');
        console.log('[Recording][API] HTTP Status:', res.status);
      } else if (recordingState === 'idle' || recordingState === 'completed' || recordingState === 'failed') {
        // Start recording
        console.log('[Recording][API] START request');
        console.log('[Recording][API] Room ID:', roomId);
        res = await fetch(`${apiUrl}/class-recordings/start`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
        
        console.log('[Recording][API] START response');
        console.log('[Recording][API] HTTP Status:', res.status);
      }
      
      if (res) {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[Recording][API] FAILED');
          console.error('[Recording][API] Status:', res.status);
          console.error('[Recording][API] Response:', errorText);
        } else {
          const data = await res.json();
          console.log('[Recording][API] Response Data:', data);
        }
      }
    } catch (err) {
      console.error('[Recording][API] FAILED EXCEPTION');
      console.error('[Recording][API] Message:', err.message);
    }
  };"""

    pattern = re.compile(r'const\s+handleToggleRecording\s*=\s*async\s*\(\)\s*=>\s*\{.*?\n  \};', re.DOTALL)
    new_content = pattern.sub(handleToggleRecording_replacement, content, count=1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # Update useClassroomRealtime.js
    file_path2 = r'r:\ClientProject\MediacalKV\fe\src\pages\classroom-preview\hooks\useClassroomRealtime.js'
    with open(file_path2, 'r', encoding='utf-8') as f:
        content2 = f.read()

    # Replacing socket event handlers for recording
    replacements = {
        r"newSocket\.on\('class:recording-started',\s*\(payload\)\s*=>\s*\{.*?\}\);": """newSocket.on('class:recording-started', (payload) => {
      console.log('[Recording][Socket] Received recording-started');
      console.log('[Recording][Socket] Room:', payload.roomId);
      console.log('[Recording][Socket] Recording ID:', payload.recordingId);
      setRecordingState(payload.status || 'recording');
      setRecordingStartedAt(payload.startedAt || new Date());
    });""",
        r"newSocket\.on\('class:recording-stopping',\s*\(payload\)\s*=>\s*\{.*?\}\);": """newSocket.on('class:recording-stopping', (payload) => {
      console.log('[Recording][Socket] Received recording-stopping');
      setRecordingState('stopping');
    });""",
        r"newSocket\.on\('class:recording-completed',\s*\(payload\)\s*=>\s*\{.*?\}\);": """newSocket.on('class:recording-completed', (payload) => {
      console.log('[Recording][Socket] Received recording-completed');
      setRecordingState('completed');
    });""",
        r"newSocket\.on\('class:recording-failed',\s*\(payload\)\s*=>\s*\{.*?\}\);": """newSocket.on('class:recording-failed', (payload) => {
      console.log('[Recording][Socket] Received recording-failed');
      setRecordingState('failed');
    });"""
    }

    new_content2 = content2
    for pat, rep in replacements.items():
        new_content2 = re.sub(pat, rep, new_content2, flags=re.DOTALL)

    with open(file_path2, 'w', encoding='utf-8') as f:
        f.write(new_content2)
        
    print("Frontend replacements complete")

if __name__ == '__main__':
    main()
