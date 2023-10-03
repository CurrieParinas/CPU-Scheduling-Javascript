class Process {
    constructor(id, arrivalTime, burstTime, priority) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.remainingTime = burstTime;
        this.completed = false;
        this.completionTime = null;
        this.responseTime = null;
        this.waitingTime = null;
        this.turnaroundTime = null;
    }
}

class Queue {
    constructor() {
        this.queue = [];
    }

    enqueue(process, algorithm) {
        if (algorithm == "shortestJobFirst") {
            this.queue.push(process);
            this.queue.sort((a, b) => a.burstTime - b.burstTime); //ensures that the queue is sorted with the shortest burst time
        } else if (algorithm == "shortestRemainingTimeFirst") {
            this.queue.push(process);
            this.queue.sort((a, b) => a.remainingTime - b.remainingTime); //ensures that the queue is sorted with the shortest remaining time
        } else if (algorithm == "priorityPreemptive" || algorithm == "priorityNonPreemptive") {
            if (this.isEmpty()) { // if empty just add process to queue
                this.queue.push(process);
            } else { // else iterates through the queue to find the process position based on priority
                let isAdded = false;
                for (let i = 0; i < this.queue.length; i++) {
                    if (process.priority < this.queue[i].priority) { // Trying to find the proper position of the process based on priority
                        this.queue.splice(i, 0, process); // inserting 'process' at index 'i' without removing elements ('0')
                        isAdded = true; //process is added
                        break;
                    }
                }
                if (!isAdded) { // if no process have a higher priority(lower number), add the process to the end of queue
                    this.queue.push(process);
                }
            }
        } else { //add process to queue if sorting or prioritization is not needed for the algorithm
            this.queue.push(process);
        }
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue.shift(); //if queue is not empty, remove first element and shift all element to lower index (-1)
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue[0]; //returns the first element in the queue (at index 0)
    }

    isEmpty() {
        return this.queue.length === 0; // returns boolean if queue length is strictly zero (=== -> strict equality)
    }
}

function firstComeFirstServed(processes) {
    let currentTime = 0;
    let minimumArrivalTime = Infinity;

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime); //sort by arrival time

    for (let i = 0; i < processes.length; i++) {//iterates through the processes
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
            minimumArrivalTime = process.arrivalTime; //if the process' arrival time is smaller than the current minimum, update minimumArrivalTime
        }
    }

    //ensures that the simulation starts at the correct time, to align the simulation start time with the earliest arrival time of the processes
    while (currentTime < minimumArrivalTime) { 
        currentTime++;
    }

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];

        //process data
        process.completionTime = currentTime + process.burstTime;
        process.waitingTime = currentTime - process.arrivalTime;
        process.responseTime = process.waitingTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;

        currentTime = process.completionTime;
        
        //gantt chart
        const processNumberinGanttChart = createBar(`P${process.id}`, 1, `#121722`);
        chartContainer.appendChild(processNumberinGanttChart);
        const processBar = createBar(process.completionTime, process.completionTime / 3,`#27374D`);
        chartContainer.appendChild(processBar);
    }

    const averages = calculateAverages(processes);

    return {
        processes,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function shortestJobFirst(processes, algo) {
    const algoQueue = new Queue();
    let currentTime = 0;
    let minimumArrivalTime = Infinity;

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
        minimumArrivalTime = process.arrivalTime;
        }
    }

    while (currentTime < minimumArrivalTime) {
        currentTime++;
    }

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    let completedProcesses = [];
    let process = null;

    while (true) {
        for (let i = 0; i < processes.length; i++) { //iterates through the processes and enqueues the process if it arrives at the current time
        const arrivedProcess = processes[i];
            if (arrivedProcess.arrivalTime === currentTime) {
                algoQueue.enqueue(arrivedProcess, algo);
            }
        }

        if (process === null && algoQueue.isEmpty()) { //breaks the loop if no currently executing process and the queue is empty
            break;
        }

        if (process !== null && process.remainingTime === 0) {
            process.completionTime = currentTime;
            process.waitingTime =
                process.completionTime - process.arrivalTime - process.burstTime;
            process.responseTime = process.waitingTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            completedProcesses.push(process);

            const processNumberinGanttChart = createBar(`P${process.id}`, 1, `#121722`);
            chartContainer.appendChild(processNumberinGanttChart);
            const processBar = createBar(process.completionTime,process.completionTime / 3,`#27374D`);
            chartContainer.appendChild(processBar);

            process = null;
        }

        if (process === null && !algoQueue.isEmpty()) {
            process = algoQueue.dequeue();
        }

        if (process !== null) {
            process.remainingTime--;
        }

        currentTime++;
    }

    const averages = calculateAverages(processes);

    return {
        processes,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function shortestRemainingTimeFirst(processes,algo) {
    const algoQueue = new Queue();
    let currentTime = 0;
    let completedProcesses = [];

    let minimumArrivalTime = Infinity;

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
            minimumArrivalTime = process.arrivalTime;
        }
    }

    while (currentTime < minimumArrivalTime) {
        currentTime++;
    }
  
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    let lastProcessId = null;
    while (true) {

        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            if (process.arrivalTime === currentTime) {
                algoQueue.enqueue(process,algo);
            }
      }
  
        if (algoQueue.isEmpty() && completedProcesses.length === processes.length) {
            break;
        }
  
        const currentProcess = algoQueue.dequeue();
  
        if (currentProcess.remainingTime === currentProcess.burstTime) {
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }
  
        currentProcess.remainingTime--;      

        if (currentProcess.remainingTime === 0) {
            currentProcess.completionTime = currentTime + 1;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        
            completedProcesses.push(currentProcess);

        } else {
            algoQueue.enqueue(currentProcess,algo);
        }

        if (currentProcess.id !== lastProcessId) {
            const processNumberinGanttChart = createBar(`P${currentProcess.id}`, 1, `#121722`);
            chartContainer.appendChild(processNumberinGanttChart);
            const processBar = createBar(currentTime, currentTime/3, `#27374D`);
            chartContainer.appendChild(processBar);

            lastProcessId = currentProcess.id;
            lastCompletionTime = currentProcess.completionTime;
        } else {
            lastCompletionTime = currentTime; 
        }

        currentTime++;
    }
    if (lastCompletionTime !== currentTime) {
        const lastprocessBar = createBar(lastCompletionTime+1, (lastCompletionTime+1)/3, `#27374D`);
        chartContainer.appendChild(lastprocessBar);
    }
    const averages = calculateAverages(processes);
    return {
        processes,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function priorityPreemptive(processes, algo) {
    const algoQueue = new Queue();
    let currentTime = 0;
    let completedProcesses = [];

    let minimumArrivalTime = Infinity;

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
            minimumArrivalTime = process.arrivalTime;
        }
    }

    while (currentTime < minimumArrivalTime) {
        currentTime++;
    }

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    let lastProcessId = null;
    let lastCompletionTime = 0;

    while (true) {
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            if (process.arrivalTime === currentTime) {
                algoQueue.enqueue(process, algo);
            }
        }

        lastCompletionTime = currentTime;

        if (algoQueue.isEmpty() && completedProcesses.length === processes.length) { //queue is empty and all process is completed, break the loop
            break;
        }

        const currentProcess = algoQueue.peek(); //checks the first process

        if (currentProcess.remainingTime === currentProcess.burstTime) { //if current process just started executing, calculate the response time
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }

        currentProcess.remainingTime--;//simulating the consumption of the burst time

        if (currentProcess.remainingTime === 0) {//when process is complete
            currentProcess.completionTime = currentTime + 1;
            currentProcess.turnaroundTime =
                currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime =
                currentProcess.turnaroundTime - currentProcess.burstTime;
            currentProcess.completed = true;

            completedProcesses.push(currentProcess);

            algoQueue.dequeue();
        }

        if (currentProcess.id !== lastProcessId) {
            const processBar = createBar(currentTime,currentTime / 3,`#27374D`);
            chartContainer.appendChild(processBar);
            const processNumberinGanttChart = createBar(`P${currentProcess.id}`,1,`#121722`);
            chartContainer.appendChild(processNumberinGanttChart);

            lastProcessId = currentProcess.id;
            lastCompletionTime = currentProcess.completionTime;
        } else {
            lastCompletionTime = currentTime;
        }
        currentTime++;
    }

    if (lastCompletionTime === currentTime) {
        const lastprocessBar = createBar(lastCompletionTime,lastCompletionTime / 3,`#27374D`);
        chartContainer.appendChild(lastprocessBar);
    }
    const averages = calculateAverages(processes);
    return {
        processes: completedProcesses,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function priorityNonPreemptive(processes, algo) {
    const algoQueue = new Queue();
    let currentTime = 0;
    let completedProcesses = [];

    let minimumArrivalTime = Infinity;

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
            minimumArrivalTime = process.arrivalTime;
        }
    }

    while (currentTime < minimumArrivalTime) {
        currentTime++;
    }

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    while (completedProcesses.length < processes.length || !algoQueue.isEmpty()) {
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            if (process.arrivalTime === currentTime) {
                algoQueue.enqueue(process, algo);
            }
        }

        if (algoQueue.isEmpty()) {
            currentTime++;
            continue;
        }

        let currentProcess = algoQueue.dequeue();

        if (currentProcess.remainingTime === currentProcess.burstTime) {
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }

        while (currentProcess.remainingTime > 0) {
            currentProcess.remainingTime--;
            currentTime++;

            for (let i = 0; i < processes.length; i++) {
                const process = processes[i];
                if (process.arrivalTime === currentTime) { //checks for new process arrival
                    algoQueue.enqueue(process, algo); 
                }
            }
        }

        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime =
        currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime =
        currentProcess.turnaroundTime - currentProcess.burstTime;
        currentProcess.completed = true;

        if (completedProcesses.length < processes.length) {
            const processNumberinGanttChart = createBar(`P${currentProcess.id}`,1,`#121722`);
            chartContainer.appendChild(processNumberinGanttChart);
            const processBar = createBar(currentProcess.completionTime,currentProcess.completionTime / 3,`#27374D`);
            chartContainer.appendChild(processBar);
        }
        completedProcesses.push(currentProcess);
    }
    const averages = calculateAverages(processes);
    return {
        processes: completedProcesses,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function roundRobin(processes, quantum, algo) {
    const sortedProcesses = processes.sort(
        (a, b) => a.arrivalTime - b.arrivalTime
    );
    const processQueue = [...sortedProcesses];
    let currentTime = 0;
    const completedProcesses = [];

    let minimumArrivalTime = Infinity;

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        if (process.arrivalTime < minimumArrivalTime) {
            minimumArrivalTime = process.arrivalTime;
        }
    }

    while (currentTime < minimumArrivalTime) {
        currentTime++;
    }

    const chartContainer = document.createElement("div");
    chartContainer.className = "chart-container";
    const startBar = createBar(currentTime, 1, `#27374D`);
    chartContainer.appendChild(startBar);

    let algoQueue = [];
    while (processQueue.length > 0 || algoQueue.length > 0) {
        while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
            const process = processQueue.shift();
            algoQueue.push(process);
        }

        const currentProcess = algoQueue.shift();
        if (!currentProcess) {
            currentTime++;
            continue;
        }

        if (currentProcess.responseTime === null) {
            currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
        }

        const remainingTime = Math.max(currentProcess.remainingTime - quantum, 0);
        currentTime += Math.min(currentProcess.remainingTime, quantum);

        while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
            const process = processQueue.shift();
            algoQueue.push(process);
        }

        if (remainingTime > 0) {
            currentProcess.remainingTime = remainingTime;
            algoQueue.push(currentProcess);
        } else {
            currentProcess.completed = true;
            currentProcess.completionTime = currentTime;
            currentProcess.waitingTime =
                currentProcess.completionTime -
                currentProcess.arrivalTime -
                currentProcess.burstTime;
            currentProcess.turnaroundTime =
                currentProcess.completionTime - currentProcess.arrivalTime;
            completedProcesses.push(currentProcess);
        }

        const processNumberinGanttChart = createBar(`P${currentProcess.id}`,1,`#121722`);
        chartContainer.appendChild(processNumberinGanttChart);
        if (currentProcess.completed) {
        const processBar = createBar(currentProcess.completionTime,currentProcess.completionTime / 3,`#27374D`);
        chartContainer.appendChild(processBar);
        } else {
        const intervalBar = createBar(currentTime,currentTime / 3,`#27374D`);
        chartContainer.appendChild(intervalBar);
        }
    }

    const averages = calculateAverages(processes);
    return {
        processes: completedProcesses,
        averages,
        ganttChart: chartContainer.outerHTML,
    };
}

function calculateAverages(processes) {
    const numProcesses = processes.length;
    let totalWaitingTime = 0;
    let totalResponseTime = 0;
    let totalTurnaroundTime = 0;

    for (let i = 0; i < numProcesses; i++) {
        const process = processes[i];
        totalWaitingTime += process.waitingTime;
        totalResponseTime += process.responseTime;
        totalTurnaroundTime += process.turnaroundTime;
    }

    const avgWaitingTime = totalWaitingTime / numProcesses;
    const avgResponseTime = totalResponseTime / numProcesses;
    const avgTurnaroundTime = totalTurnaroundTime / numProcesses;

    return {
        avgWaitingTime,
        avgResponseTime,
        avgTurnaroundTime,
    };
}

function createBar(label, duration, color) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${duration * 30}px`;
    bar.style.backgroundColor = color;
    bar.style.display = "inline-block";

    const labelContainer = document.createElement("div");
    labelContainer.className = "label-container";
    labelContainer.textContent = label;
    labelContainer.style.textAlign = "center";

    bar.appendChild(labelContainer);

    return bar;
}

const processForm = document.getElementById("process-form");
const processesTable = document.getElementById("processes-table");
const startContainer = document.getElementById("start-container");
let algorithm = document.getElementById("algorithm").value;

processForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const numProcesses = parseInt(document.getElementById("num-processes").value);
    const timeQuantum = parseInt(document.getElementById("time-quantum").value);
    const algorithm = document.getElementById("algorithm").value;

    if (algorithm === "roundRobin" && isNaN(timeQuantum)) {
        alert("Time Quantum is required in Round Robin Algorithm");
    } else {
        const tableBody = processesTable.querySelector("tbody");
        tableBody.innerHTML = "";

        for (let i = 1; i <= numProcesses; i++) {
            const newRow = tableBody.insertRow(-1);
            newRow.innerHTML = `
            <td>${i}</td>
            <td><input type="number" id="arrival-time-${i}" name="arrival-time-${i}" required></td>
            <td><input type="number" id="burst-time-${i}" name="burst-time-${i}" required></td>
            <td><input type="number" id="priority-${i}" name="priority-${i}"></td>
            `;
        }
    }
});

const resultContainer = document.getElementById("result-container");

function toggleTimeQuantum() {
    var algorithm = document.getElementById("algorithm").value;
    var timeQuantumContainer = document.getElementById("time-quantum-container");

    if (algorithm === "roundRobin") {
        timeQuantumContainer.style.display = "block";
    } else {
        timeQuantumContainer.style.display = "none";
    }
}

function main() {
    const numProcesses = parseInt(document.getElementById("num-processes").value);
    const timeQuantum = parseInt(document.getElementById("time-quantum").value);
    const algorithm = document.getElementById("algorithm").value;

    const processes = [];

    for (let i = 1; i <= numProcesses; i++) {
        const id = i;
        const arrivalTime = parseInt(document.getElementById(`arrival-time-${i}`).value);
        const burstTime = parseInt(document.getElementById(`burst-time-${i}`).value);
        const priority = parseInt(document.getElementById(`priority-${i}`).value);
        processes.push(new Process(id, arrivalTime, burstTime, priority));
    }

    for (let i = 0; i < processes.length; i++) {
        if (isNaN(processes[i].arrivalTime) || processes[i].arrivalTime === undefined) {
            alert("Please input arrival time for all processes");
            return;
        }
    }

    for (let i = 0; i < processes.length; i++) {
        if (isNaN(processes[i].burstTime) || processes[i].burstTime === undefined) {
            alert("Burst time is required for all processes");
            return;
        }
    }

    if (algorithm === "priorityPreemptive" || algorithm === "priorityNonPreemptive") {
        for (let i = 0; i < processes.length; i++) {
            if (isNaN(processes[i].priority) || processes[i].priority === undefined) {
                alert(
                "Priority of processes is required in all Priority algorithm"
                );
                return;
            }
        }
    }

    if (algorithm === "roundRobin" && isNaN(timeQuantum)) {
        alert("Time Quantum is required in Round Robin Algorithm");
        return;
    }

    let result;

    switch (algorithm) {
        case "firstComeFirstServed":
            result = firstComeFirstServed(processes);
            break;
        case "shortestJobFirst":
            result = shortestJobFirst(processes, algorithm);
            break;
        case "shortestRemainingTimeFirst":
            result = shortestRemainingTimeFirst(processes, algorithm);
            break;
        case "priorityPreemptive":
            result = priorityPreemptive(processes, algorithm);
            break;
        case "priorityNonPreemptive":
            result = priorityNonPreemptive(processes, algorithm);
            break;
        case "roundRobin":
            result = roundRobin(processes, timeQuantum, algorithm);
            break;
        default:
            console.error(`Invalid algorithm: ${algorithm}`);
            return;
    }

    processes.sort((a, b) => a.id - b.id);

    const table = document
        .getElementById("process-table")
        .getElementsByTagName("tbody")[0];
    table.innerHTML = "";

    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        const row = table.insertRow(i);
        row.insertCell(0).innerHTML = process.id;
        row.insertCell(1).innerHTML = process.arrivalTime;
        row.insertCell(2).innerHTML = process.burstTime;
        row.insertCell(3).innerHTML = process.priority;
        row.insertCell(4).innerHTML = process.completionTime;
        row.insertCell(5).innerHTML = process.responseTime;
        row.insertCell(6).innerHTML = process.waitingTime;
        row.insertCell(7).innerHTML = process.turnaroundTime;
    }

    numProcessesLength = processes.length;
    const row = table.insertRow(numProcessesLength);
    row.insertCell(0).innerHTML = "";
    row.insertCell(1).innerHTML = "";
    row.insertCell(2).innerHTML = "";
    row.insertCell(3).innerHTML = "";
    row.insertCell(4).innerHTML = "<b>Average:</b>";
    row.insertCell(5).innerHTML = result.averages.avgResponseTime.toFixed(2);
    row.insertCell(6).innerHTML = result.averages.avgWaitingTime.toFixed(2);
    row.insertCell(7).innerHTML = result.averages.avgTurnaroundTime.toFixed(2);

    document.getElementById("gantt-chart").innerHTML = result.ganttChart;
}

