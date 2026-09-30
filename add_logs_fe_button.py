import re

def main():
    file_path = r'r:\ClientProject\MediacalKV\fe\src\pages\classroom-preview\ClassroomPage.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    handleToggleRecording_replacement = """const handleToggleRecording = async () => {
    console.log('[Recording][UI] ================================');
    console.log('[Recording][UI] RECORD BUTTON CLICKED');
    console.log('[Recording][UI] Room ID:', roomId);
    console.log('[Recording][UI] User ID:', user?._id || user?.id);
    console.log('[Recording][UI] User Role:', userRole);
    console.log('[Recording][UI] Current State:', recordingState);
    console.log('[Recording][UI] Time:', new Date().toISOString());

    const isAuthorized = ['teacher', 'admin', 'Admin', 'Faculty'].includes(userRole);
    console.log('[Recording][Permission] Frontend recording permission:', {
      userRole,
      canRecord: isAuthorized
    });

    if (!isAuthorized) {
      console.warn('[Recording][UI] START BLOCKED');
      console.warn('[Recording][UI] Reason: userRole is not authorized');
      console.warn('[Recording][UI] userRole:', userRole);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    try {
      let res;
      if (recordingState === 'recording' || recordingState === 'paused') {
        const url = `${apiUrl}/class-recordings/stop`;
        console.log('[Recording][API] STOP URL:', url);
        console.log('[Recording][API] Sending STOP request');
        res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
        
        console.log('[Recording][API] STOP response:', { status: res.status });
      } else if (recordingState === 'idle' || recordingState === 'completed' || recordingState === 'failed') {
        const url = `${apiUrl}/class-recordings/start`;
        console.log('[Recording][API] START URL:', url);
        console.log('[Recording][API] Sending START request');
        res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ roomName: roomId })
        });
        
        console.log('[Recording][API] START response:', { status: res.status });
      }
      
      if (res) {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[Recording][API] FAILED:', {
            status: res.status,
            data: errorText
          });
        } else {
          const data = await res.json();
          console.log('[Recording][API] SUCCESS:', data);
        }
      }
    } catch (err) {
      console.error('[Recording][API] START FAILED:', {
        message: err.message
      });
    }
  };"""

    pattern = re.compile(r'const\s+handleToggleRecording\s*=\s*async\s*\(\)\s*=>\s*\{.*?\n  \};', re.DOTALL)
    new_content = pattern.sub(handleToggleRecording_replacement, content, count=1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Frontend replacements complete for ClassroomPage.jsx")

if __name__ == '__main__':
    main()
