import React, { useState } from "react";
import { useStudyModelStore } from "./StudyModel";

interface Props {
  message: string;
  /** Show the "Download session data" button (debrief screen only). */
  showDownloadButton?: boolean;
  onDownload?: () => Promise<void>;
}

export default function StudyMessage({ message, showDownloadButton, onDownload }: Props) {
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 5, maxWidth: 600 }}>
        <span dangerouslySetInnerHTML={{ __html: message }} />

        {showDownloadButton && (
          <div style={{ marginTop: 20, padding: 16, background: '#f0f7ff', borderRadius: 6, border: '1px solid #b3d1f7' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 14 }}>
              Session complete — please download the data before closing this tab.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                padding: '10px 20px',
                background: downloading ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: downloading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: 14,
                width: '100%',
              }}
            >
              {downloading ? 'Preparing ZIP…' : '⬇ Download session data (.zip)'}
            </button>
          </div>
        )}

        <div style={{ width: '100%', display: "flex", justifyContent: "right", marginTop: 15 }}>
          <button onClick={nextStep}>Next</button>
        </div>
      </div>
    </div>
  );
}
