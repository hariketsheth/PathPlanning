const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.height = innerHeight > innerWidth ? innerWidth - 50 : innerHeight - 50;
canvas.width = canvas.height;

const gridSize = document.getElementById("gridSize");
const iterationDelay = document.getElementById("iterationDelay");

let rows = gridSize.value;
let columns = rows;
let grid = new Array(rows);
let cellWidth = canvas.height / rows;

const createGrid = () => {
  for (let i = 0; i < rows; i++) {
    grid[i] = new Array(columns);
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let isBlocked = Math.random();

      const cell = new Cell(x, y, isBlocked < 0.2);
      cell.show();
      grid[y][x] = cell;
    }
  }
  for (let col = 0; col < rows; col++) {
    grid[col].forEach((i) => i.addNeighbors(grid));
  }
};
createGrid();

let start = grid[random(rows)][random(columns)];
start.blocked = false;
let end = grid[random(rows)][random(columns)];
end.blocked = false;

let path = [start];
let openSet = [start];
let closedSet = [];

function colorStuff() {
  for (let i = 0; i < openSet.length; i++) {
    openSet[i].show("hsl(80, 50%, 50%)");
  }
  for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].show("hsl(90, 51%, 20%)");
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (grid[i][j].blocked) {
        grid[i][j].show("black");
      }
    }
  }
  start.show("hsl(58, 70%, 52%)");
  end.show("hsl(0, 50%, 50%)");
}

function iteration() {
  if (!openSet.length) {
    alert("More cells are not available");
    return "no solution";
  }
  colorStuff();

  let winner = 0;
  for (let i = 0; i < openSet.length; i++) {
    if (openSet[i].f < openSet[winner].f) {
      winner = i;
    }
  }

  const current = openSet[winner];
  showPath(current);
  if (current === end) {
    alert("Completed! Path is shown in Light Green");
    return "done!";
  }

  openSet = removeFromArr(openSet, current);
  closedSet.push(current);

  const neighbors = current.neighbors;
  neighbors.forEach((neighbor) => {
    if (!closedSet.includes(neighbor) && !neighbor.blocked) {
      const tempG = current.g + 1;

      if (openSet.includes(neighbor)) {
        if (tempG < neighbor.g) {
          neighbor.g = tempG;
        }
      } else {
        neighbor.g = tempG;
        openSet.push(neighbor);
      }
      neighbor.h = heuristic(neighbor, end);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.previous = current;
    }
  });
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
let interrumpt;

async function solve() {
  let solvedYet = iteration();
  while (!solvedYet && !interrumpt) {
    solvedYet = iteration();
    await timer(iterationDelay.value);
  }
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function showPath(current) {
  let path = [];
  let currentCopy = { ...current };
  path.push(currentCopy);
  while (currentCopy.previous) {
    path.push(currentCopy.previous);
    currentCopy = currentCopy.previous;
  }
  path.forEach((i) => i.show("hsl(88, 70%, 60%)"));
}

function removeFromArr(arr, item) {
  return arr.filter((i) => i !== item);
}

function random(max) {
  return Math.floor(Math.random() * max);
}

function Cell(x, y, blocked) {
  this.x = x;
  this.y = y;
  this.blocked = blocked;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.previous = null;
  this.neighbors = [];
  this.show = (color) => {
    ctx.beginPath();
    ctx.rect(this.x * cellWidth, this.y * cellWidth, cellWidth, cellWidth);
    ctx.fillStyle = color ? color : "#ddd";
    ctx.fill();
    ctx.stroke();
  };

  this.addNeighbors = function (grid) {
    if (this.y > 0) {
      this.neighbors.push(grid[this.y - 1][this.x]);
    }
    if (this.y < rows - 1) {
      this.neighbors.push(grid[this.y + 1][this.x]);
    }
    if (this.x > 0) {
      this.neighbors.push(grid[this.y][this.x - 1]);
    }
    if (this.x < columns - 1) {
      this.neighbors.push(grid[this.y][this.x + 1]);
    }
  };
}

async function newGrid() {
  interrumpt = true;
  await timer(iterationDelay.value);
  interrumpt = false;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  columns = gridSize.value;
  rows = columns;
  grid = new Array(rows);
  cellWidth = canvas.height / rows;

  createGrid();
  start = grid[random(rows)][random(columns)];
  start.blocked = false;
  end = grid[random(rows)][random(columns)];
  end.blocked = false;

  path = [start];
  openSet = [start];
  closedSet = [];

  colorStuff();
}

colorStuff();
