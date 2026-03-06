import React from "react";
import { useModelStore } from '../model/Model';
import { useStudyModelStore } from "./study/StudyModel";
import GithubCorner from "react-github-corner";

export default function Launcher(props: { children: React.ReactNode, leftSide?: React.ReactNode }) {
  const resetModel = useModelStore((state) => state.reset);
  const resetStudyModel = useStudyModelStore((state) => state.reset);

  return <div className="short-pulse" style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
    <GithubCorner href="https://github.com/m-damien/DirectGPT"/>
    <h1>FactCheck Study</h1>
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
      <button style={{ width: 200, height: 50, borderRadius: 5, fontSize: 20, fontWeight: 'bold' }} onClick={() => {
        resetModel();
        resetStudyModel();
        window.location.hash = '/study' + '?pid=' + (document.getElementById("participantIdSelectBox") as HTMLSelectElement).value;
      }}>Start</button>
    </div>
  </div>
}
