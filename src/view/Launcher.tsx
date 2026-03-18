import React, { useState } from "react";
import { useModelStore } from '../model/Model';
import { useStudyModelStore } from "./study/StudyModel";
import GithubCorner from "react-github-corner";

const CONSENT_ITEMS = [
  "I confirm that I have read and understand the Participant Information Sheet.",
  "I have had the opportunity to ask questions and have had these answered satisfactorily.",
  "I understand that my participation is voluntary and that I am free to withdraw at any time without giving a reason.",
  "I agree that data gathered in this study may be stored anonymously and securely, and may be used for future research.",
  "I agree to take part in this study.",
];

export default function Launcher(props: { children: React.ReactNode, leftSide?: React.ReactNode }) {
  const resetModel = useModelStore((state) => state.reset);
  const resetStudyModel = useStudyModelStore((state) => state.reset);
  const [checked, setChecked] = useState<boolean[]>(CONSENT_ITEMS.map(() => false));

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  return <div className="short-pulse" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '40px 20px', boxSizing: 'border-box' }}>
    <GithubCorner href="https://github.com/m-damien/DirectGPT"/>
    <h1>FactCheck Study</h1>

    {/* Consent Form */}
    <div style={{ maxWidth: 700, width: '100%', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
      <div style={{ background: '#f0f0f0', padding: '10px 20px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
        Please tick all the boxes that apply
      </div>
      {CONSENT_ITEMS.map((text, i) => (
        <div
          key={i}
          onClick={() => toggle(i)}
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
            padding: '16px 20px', borderBottom: i < CONSENT_ITEMS.length - 1 ? '1px solid #e8e8e8' : 'none',
            cursor: 'pointer', background: checked[i] ? '#f7fff7' : 'white',
            transition: 'background 0.15s',
          }}
        >
          <span style={{ fontWeight: 'bold', minWidth: 28, fontSize: 16 }}>{i + 1}</span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 15, lineHeight: '1.5' }}>{text}</span>
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => toggle(i)}
            onClick={e => e.stopPropagation()}
            style={{ width: 20, height: 20, marginLeft: 20, marginTop: 2, flexShrink: 0, cursor: 'pointer' }}
          />
        </div>
      ))}
    </div>

    {/* Participant ID + Start */}
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
      <h2>Participant ID: </h2>
      <select id="participantIdSelectBox" style={{ width: 200, height: 50, borderRadius: 5, fontSize: 20, fontWeight: 'bold' }}>
        <option value="0">P0</option>
        <option value="1">P1</option>
        <option value="2">P2</option>
        <option value="3">P3</option>
        <option value="4">P4</option>
        <option value="5">P5</option>
        <option value="6">P6</option>
        <option value="7">P7</option>
        <option value="8">P8</option>
        <option value="9">P9</option>
        <option value="10">P10</option>
        <option value="11">P11</option>
      </select>
      <button
        disabled={!allChecked}
        style={{
          width: 200, height: 50, borderRadius: 5, fontSize: 20, fontWeight: 'bold',
          opacity: allChecked ? 1 : 0.4, cursor: allChecked ? 'pointer' : 'not-allowed',
        }}
        onClick={() => {
          resetModel();
          resetStudyModel();
          window.location.hash = '/study' + '?pid=' + (document.getElementById("participantIdSelectBox") as HTMLSelectElement).value + '&dataSaved=true';
        }}
      >Start</button>
    </div>
    {!allChecked && (
      <p style={{ color: '#888', marginTop: 12, fontSize: 14 }}>Please tick all consent boxes to continue.</p>
    )}
  </div>
}
