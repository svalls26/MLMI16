import React, { useState } from "react";
import { useStudyModelStore } from "./StudyModel";

const ITEMS = [
  { key: 'mentalEffort', label: 'How much mental effort did you invest while using this interface?' },
  { key: 'reliance', label: 'To what degree did you rely on this interface rather than engaging analytically yourself?' },
  { key: 'sourceEngagement', label: 'How actively did you engage with the source document while using this interface?' },
];

const LABELS: Record<number, string> = {
  1: '1 — Very low',
  2: '2',
  3: '3',
  4: '4 — Moderate',
  5: '5',
  6: '6',
  7: '7 — Very high',
};

interface InterfaceRatings {
  [key: string]: number;
}

function InterfaceBlock({
  interfaceName,
  displayName,
  ratings,
  onChange,
}: {
  interfaceName: string;
  displayName: string;
  ratings: InterfaceRatings;
  onChange: (key: string, value: number) => void;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ borderBottom: '2px solid #2980b9', paddingBottom: 6, color: '#2980b9' }}>
        {displayName}
      </h3>
      {ITEMS.map((item) => (
        <div key={item.key} style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>{item.label}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((val) => (
              <label key={val} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                cursor: 'pointer', minWidth: 50,
                padding: '6px 8px', borderRadius: 5,
                background: ratings[item.key] === val ? '#d6eaf8' : '#f5f5f5',
                border: `1px solid ${ratings[item.key] === val ? '#2980b9' : '#ddd'}`,
              }}>
                <input
                  type="radio"
                  name={`${interfaceName}_${item.key}`}
                  checked={ratings[item.key] === val}
                  onChange={() => onChange(item.key, val)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: 12 }}>{LABELS[val]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CognitiveEffortQuestionnaire({
  interfaceOrder,
}: {
  interfaceOrder: ['direct' | 'chat', 'direct' | 'chat'];
}) {
  const nextStep = useStudyModelStore((state) => state.nextStep);
  const logEvent = useStudyModelStore((state) => state.logEvent);

  const [directRatings, setDirectRatings] = useState<InterfaceRatings>({});
  const [chatRatings, setChatRatings] = useState<InterfaceRatings>({});

  const allFilled =
    ITEMS.every((item) => directRatings[item.key] !== undefined) &&
    ITEMS.every((item) => chatRatings[item.key] !== undefined);

  const handleSubmit = () => {
    logEvent('QUESTIONNAIRE_SUBMITTED', { directRatings, chatRatings });
    nextStep();
  };

  const blocks = interfaceOrder.map((iface) =>
    iface === 'direct'
      ? {
          interfaceName: 'direct',
          displayName: 'DirectGPT interface',
          ratings: directRatings,
          onChange: (key: string, val: number) => setDirectRatings((r) => ({ ...r, [key]: val })),
        }
      : {
          interfaceName: 'chat',
          displayName: 'ChatGPT interface',
          ratings: chatRatings,
          onChange: (key: string, val: number) => setChatRatings((r) => ({ ...r, [key]: val })),
        }
  );

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      padding: '40px 20px', boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 720, width: '100%', background: 'white', borderRadius: 8, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>Stage 6 — Cognitive Effort Questionnaire</h2>
        <p style={{ color: '#555' }}>
          Please rate each interface on the following items using a scale from 1 (very low) to 7 (very high).
          Reflect on your experience across both tasks completed with each interface.
        </p>

        {blocks.map((b) => (
          <InterfaceBlock key={b.interfaceName} {...b} />
        ))}

        <div style={{ textAlign: 'right' }}>
          <button
            disabled={!allFilled}
            onClick={handleSubmit}
            style={{
              padding: '12px 32px', background: allFilled ? '#2980b9' : '#bdc3c7',
              color: 'white', border: 'none', borderRadius: 5,
              cursor: allFilled ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: 15,
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
