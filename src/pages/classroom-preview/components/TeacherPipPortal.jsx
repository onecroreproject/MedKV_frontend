import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import TeacherPipContent from './TeacherPipContent';

/**
 * Copies all active styles and stylesheets from the main document to the PiP window
 * so Tailwind CSS and custom fonts render with 100% fidelity.
 */
export function copyStylesToPip(targetDoc) {
  // 1. Copy all <link rel="stylesheet"> elements
  document.querySelectorAll('link[rel="stylesheet"]').forEach((linkEl) => {
    try {
      const newLink = targetDoc.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = linkEl.href;
      targetDoc.head.appendChild(newLink);
    } catch (e) {}
  });

  // 2. Copy direct <style> tags (Vite injected styles)
  document.querySelectorAll('style').forEach((styleEl) => {
    try {
      const newStyle = targetDoc.createElement('style');
      newStyle.textContent = styleEl.textContent;
      targetDoc.head.appendChild(newStyle);
    } catch (e) {}
  });

  // 3. Complete standalone fallback CSS ensuring beautiful layout regardless of stylesheet loading
  try {
    const fallback = targetDoc.createElement('style');
    fallback.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { 
        height: 100vh !important; 
        width: 100vw !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        overflow: hidden !important; 
        background-color: #0b0f19 !important; 
        color: #f8fafc !important; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      }
      button { cursor: pointer; border: none; outline: none; font-family: inherit; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      .animate-bounce-subtle { animation: bounce-subtle 1.8s ease-in-out infinite; }
    `;
    targetDoc.head.appendChild(fallback);
  } catch (e) {}
}

/**
 * Opens a Document Picture-in-Picture window.
 * MUST be invoked directly from a user click handler to satisfy browser user-activation rules.
 */
export async function openTeacherPipWindow(title = 'Live Lecture') {
  // 1. Modern Chromium Document Picture-in-Picture API
  if ('documentPictureInPicture' in window) {
    const pipWin = await window.documentPictureInPicture.requestWindow({
      width: 400,
      height: 340,
    });

    pipWin.document.title = `${title} — Faculty PiP`;
    copyStylesToPip(pipWin.document);

    pipWin.document.documentElement.style.height = '100vh';
    pipWin.document.documentElement.style.width = '100vw';
    pipWin.document.documentElement.style.margin = '0';
    pipWin.document.documentElement.style.padding = '0';
    pipWin.document.documentElement.style.overflow = 'hidden';

    pipWin.document.body.style.height = '100vh';
    pipWin.document.body.style.width = '100vw';
    pipWin.document.body.style.margin = '0';
    pipWin.document.body.style.padding = '0';
    pipWin.document.body.style.overflow = 'hidden';
    pipWin.document.body.style.backgroundColor = '#0b0f19';
    pipWin.document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    return pipWin;
  }

  // 2. Fallback: Standard HTML5 Video Picture-in-Picture
  const videoEl = document.querySelector('video');
  if (videoEl && document.pictureInPictureEnabled) {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoEl.requestPictureInPicture();
    }
    return null;
  }

  throw new Error('DOCUMENT_PIP_UNSUPPORTED');
}

/**
 * TeacherPipPortal
 *
 * Renders TeacherPipContent via React portal into the external always-on-top window.
 */
export default function TeacherPipPortal({
  pipWindow,
  onClose,
  user,
  title = 'Live Lecture',
  isMuted,
  onToggleMic,
  isVideoOff,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  recordingState,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onEndClass,
  onLeave,
  participantCount = 0,
  participants = [],
  waitingStudents = [],
  raisedHands = [],
  onClearHand,
  chatMessages = [],
  localCameraTrack,
}) {
  // Clean up if pipWindow closes or component unmounts
  useEffect(() => {
    if (!pipWindow) return;

    const handlePageHide = () => {
      onClose();
    };

    pipWindow.addEventListener('pagehide', handlePageHide);
    return () => {
      pipWindow.removeEventListener('pagehide', handlePageHide);
    };
  }, [pipWindow, onClose]);

  if (!pipWindow || pipWindow.closed) {
    return null;
  }

  return createPortal(
    <TeacherPipContent
      user={user}
      title={title}
      isMuted={isMuted}
      onToggleMic={onToggleMic}
      isVideoOff={isVideoOff}
      onToggleCamera={onToggleCamera}
      isScreenSharing={isScreenSharing}
      onToggleScreenShare={onToggleScreenShare}
      recordingState={recordingState}
      onPauseRecording={onPauseRecording}
      onResumeRecording={onResumeRecording}
      onStopRecording={onStopRecording}
      onEndClass={onEndClass}
      onLeave={onLeave}
      participantCount={participantCount}
      participants={participants}
      waitingStudents={waitingStudents}
      raisedHands={raisedHands}
      onClearHand={onClearHand}
      chatMessages={chatMessages}
      onFocusMainTab={() => {
        window.focus();
      }}
      onClosePip={() => {
        if (pipWindow && !pipWindow.closed) {
          pipWindow.close();
        }
        onClose();
      }}
      localCameraTrack={localCameraTrack}
    />,
    pipWindow.document.body
  );
}
