import React, { useState } from "react";
import "./App.css";

function App() {
  const [readyQueue, setReadyQueue] = useState([
    { id: "P1", burst: 3, arrival: 0 },
    { id: "P2", burst: 5, arrival: 1 },
    { id: "P3", burst: 2, arrival: 2 },
  ]);

  const [cpu, setCpu] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [running, setRunning] = useState(false);
  const [ganttChart, setGanttChart] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  const startScheduling = async () => {
    if (running) return;
    setRunning(true);

    let queue = [...readyQueue].sort((a, b) => a.arrival - b.arrival);
    let completedList = [];
    let gantt = [];
    let time = 0;

    for (let i = 0; i < queue.length; i++) {
      let current = queue[i];

      if (current.arrival > time) {
        await new Promise((resolve) =>
          setTimeout(resolve, (current.arrival - time) * 1000)
        );
        time = current.arrival;
      }

      setCpu(current);

      current.startTime = time;
      current.completionTime = time + current.burst;
      current.turnaroundTime = current.completionTime - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;

      gantt.push({ id: current.id, start: current.startTime, end: current.completionTime });
      setGanttChart([...gantt]);

      await new Promise((resolve) => setTimeout(resolve, current.burst * 1000));

      time += current.burst;
      setCurrentTime(time);

      completedList.push(current);
      setCompleted([...completedList]);

      setCpu(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setRunning(false);
  };

  return (
    <div className="App">
      <h1 className="title">FCFS Scheduling Simulation</h1>

      {/* First row: Ready Queue, CPU, Completed */}
      <div className="row-section">
        <div className="section">
          <h2>Ready Queue</h2>
          <div className="queue">
            {readyQueue.map((p) => (
              <div key={p.id} className="process">
                {p.id} (BT: {p.burst}, AT: {p.arrival})
              </div>
            ))}
          </div>
        </div>

        <div className="section cpu-section">
          <h2>CPU</h2>
          {/* Start Button placed above CPU */}
          <button
            className="start-btn"
            onClick={startScheduling}
            disabled={running}
          >
            {running ? "Running..." : "Start FCFS"}
          </button>
          <div className="cpu">
            {cpu ? (
              <div className="process active">{cpu.id}</div>
            ) : (
              <span>Idle</span>
            )}
          </div>
        </div>

        <div className="section">
          <h2>Completed Processes</h2>
          <div className="queue">
            {completed.map((p) => (
              <div key={p.id} className="process done">
                {p.id}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="section">
        <h2>Gantt Chart</h2>
        <div className="gantt">
          {ganttChart.map((g, index) => (
            <div key={index} className="gantt-block">
              <span>{g.id}</span>
              <div className="time">
                {g.start} - {g.end}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Table */}
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
                <td>{p.completionTime}</td>
                <td>{p.turnaroundTime}</td>
                <td>{p.waitingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
