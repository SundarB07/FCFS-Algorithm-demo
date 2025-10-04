import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [numProcesses, setNumProcesses] = useState("");
  const [processes, setProcesses] = useState([]);
  const [cpu, setCpu] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [ganttChart, setGanttChart] = useState([]);
  const [running, setRunning] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const simulationRef = useRef(null);

  const initializeProcesses = (n) => {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({ id: `P${i + 1}`, burst: "", arrival: "" }); // start empty
    }
    setProcesses(arr);
    setCompleted([]);
    setGanttChart([]);
    setCpu(null);
    setShowInputs(true);
    setShowSimulation(false);
  };

  const handleInputChange = (index, field, value) => {
    const newProcesses = [...processes];
    // remove leading zeros but keep "0"
    if (value === "") {
      newProcesses[index][field] = "";
    } else if (value === "0") {
      newProcesses[index][field] = 0;
    } else {
      newProcesses[index][field] = Number(value);
    }
    setProcesses(newProcesses);
  };

  const startScheduling = async () => {
    if (running) return;
    setRunning(true);
    setShowSimulation(true);

    setTimeout(() => {
      simulationRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);

    let queue = processes
      .map((p) => ({
        ...p,
        burst: Number(p.burst),
        arrival: Number(p.arrival),
      }))
      .sort((a, b) => a.arrival - b.arrival);

    let completedList = [];
    let gantt = [];
    let time = 0;

    for (let i = 0; i < queue.length; i++) {
      let current = queue[i];

      if (current.arrival > time) {
        await new Promise((resolve) =>
          setTimeout(resolve, (current.arrival - time) * 500)
        );
        time = current.arrival;
      }

      setCpu({ ...current, fade: true });
      await new Promise((resolve) => setTimeout(resolve, 100));

      current.startTime = time;
      current.completionTime = time + current.burst;
      current.turnaroundTime = current.completionTime - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;

      gantt.push({
        id: current.id,
        start: current.startTime,
        end: current.completionTime,
      });
      setGanttChart([...gantt]);

      await new Promise((resolve) => setTimeout(resolve, current.burst * 500));

      time += current.burst;

      setCpu(null);
      completedList.push(current);
      setCompleted([...completedList]);

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setRunning(false);
  };

  return (
    <div className="App">
      <h1 className="title">FCFS Scheduling Simulation</h1>

      {!showInputs && (
        <div className="input-section">
          <label>Number of Processes:</label>
          <input
            type="number"
            min="1"
            value={numProcesses}
            onChange={(e) => setNumProcesses(Number(e.target.value))}
          />
          <button onClick={() => initializeProcesses(numProcesses)}>Set</button>
        </div>
      )}

      {showInputs && !showSimulation && (
        <div>
          <div className="process-inputs">
            <div className="process-input-header">
              <span>Processes</span>
              <span>Burst Time</span>
              <span>Arrival Time</span>
            </div>

            {processes.map((p, i) => (
              <div key={p.id} className="process-input-row">
                <span>{p.id}</span>
                <input
                  type="number"
                  placeholder="Burst Time"
                  value={p.burst}
                  onChange={(e) =>
                    handleInputChange(i, "burst", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Arrival Time"
                  value={p.arrival}
                  onChange={(e) =>
                    handleInputChange(i, "arrival", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button className="start-btn" onClick={startScheduling} disabled={running}>
            {running ? "Running..." : "Start FCFS"}
          </button>
        </div>
      )}

      {showSimulation && (
        <>
          <div className="row-section" ref={simulationRef}>
            <div className="section">
              <h2>Ready Queue</h2>
              <div className="queue">
                {processes.map((p) => (
                  <div key={p.id} className="process">
                    {p.id} (BT: {p.burst}, AT: {p.arrival})
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>CPU</h2>
              <div className="cpu">
                {cpu ? (
                  <div className={`process active ${cpu.fade ? "fade-in" : ""}`}>
                    {cpu.id}
                  </div>
                ) : (
                  "Idle"
                )}
              </div>
            </div>

            <div className="section">
              <h2>Completed Processes</h2>
              <div className="queue">
                {completed.map((p) => (
                  <div key={p.id} className="process done fade-in">
                    {p.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Gantt Chart</h2>
            <div className="gantt">
              {ganttChart.map((g, index) => (
                <div key={index} className="gantt-block fade-in">
                  <span>{g.id}</span>
                  <div className="time">
                    {g.start} - {g.end}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Process Table</h2>
            <table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Completion Time</th>
                  <th>Turnaround Time</th>
                  <th>Waiting Time</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.arrival}</td>
                    <td>{p.burst}</td>
                    <td>
                      <span className="tooltip">{p.completionTime}
                        <span className="tooltiptext">
                        CT = Start Time + Burst Time = {p.startTime} + {p.burst}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="tooltip">{p.turnaroundTime}
                        <span className="tooltiptext">
                        TAT = CT - Arrival Time = {p.completionTime} - {p.arrival}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="tooltip">{p.waitingTime}
                        <span className="tooltiptext">
                        WT = TAT - Burst Time = {p.turnaroundTime} - {p.burst}
                        </span>
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* RESET BUTTON */}
          {!running && completed.length === processes.length && (
            <button
              className="start-btn"
              onClick={() => {
              setNumProcesses("");
              setProcesses([]);
              setCompleted([]);
              setGanttChart([]);
              setCpu(null);
              setShowInputs(false);
              setShowSimulation(false);
                }}
            >
            Reset Process
            </button>
          )}

        </>
      )}
    </div>
    
  );
  
}

export default App;
