interface PathfindingStep {
  grid: GridCell[][];
  visited: { row: number; col: number }[];
  current: { row: number; col: number }[];
  path: { row: number; col: number }[];
}

interface GridCell {
  row: number;
  col: number;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  parent?: GridCell;
}

export class PathfindingAlgorithms {
  private steps: PathfindingStep[] = [];
  private rows: number;
  private cols: number;

  constructor(rows: number = 20, cols: number = 30) {
    this.rows = rows;
    this.cols = cols;
  }

  private addStep(
    grid: GridCell[][],
    visited: { row: number; col: number }[] = [],
    current: { row: number; col: number }[] = [],
    path: { row: number; col: number }[] = []
  ) {
    // Update grid with path information
    const updatedGrid = grid.map(row => row.map(cell => ({ ...cell, isPath: false })));
    
    // Mark path cells
    path.forEach(p => {
      if (updatedGrid[p.row] && updatedGrid[p.row][p.col]) {
        updatedGrid[p.row][p.col].isPath = true;
      }
    });

    this.steps.push({
      grid: updatedGrid,
      visited: [...visited],
      current: [...current],
      path: [...path]
    });
  }

  private createGrid(walls: { row: number; col: number }[]): GridCell[][] {
    const grid: GridCell[][] = [];
    for (let row = 0; row < this.rows; row++) {
      grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        grid[row][col] = {
          row,
          col,
          isWall: walls.some(w => w.row === row && w.col === col),
          isVisited: false,
          isPath: false,
          distance: Infinity
        };
      }
    }
    return grid;
  }

  private getNeighbors(grid: GridCell[][], cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
    ];

    for (const [dRow, dCol] of directions) {
      const newRow = cell.row + dRow;
      const newCol = cell.col + dCol;

      if (
        newRow >= 0 &&
        newRow < this.rows &&
        newCol >= 0 &&
        newCol < this.cols &&
        !grid[newRow][newCol].isWall
      ) {
        neighbors.push(grid[newRow][newCol]);
      }
    }

    return neighbors;
  }

  private reconstructPath(endCell: GridCell): { row: number; col: number }[] {
    const path: { row: number; col: number }[] = [];
    let current: GridCell | undefined = endCell;

    while (current) {
      path.unshift({ row: current.row, col: current.col });
      current = current.parent;
    }

    return path;
  }

  dijkstra(
    start: { row: number; col: number },
    end: { row: number; col: number },
    walls: { row: number; col: number }[]
  ): PathfindingStep[] {
    this.steps = [];
    const grid = this.createGrid(walls);
    const visited: { row: number; col: number }[] = [];
    const unvisited: GridCell[] = [];

    // Initialize
    grid[start.row][start.col].distance = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        unvisited.push(grid[row][col]);
      }
    }

    this.addStep(grid, visited);

    while (unvisited.length > 0) {
      // Sort unvisited by distance
      unvisited.sort((a, b) => a.distance - b.distance);
      const current = unvisited.shift()!;

      if (current.distance === Infinity) break;

      current.isVisited = true;
      visited.push({ row: current.row, col: current.col });

      this.addStep(grid, visited, [{ row: current.row, col: current.col }]);

      if (current.row === end.row && current.col === end.col) {
        const path = this.reconstructPath(current);
        this.addStep(grid, visited, [], path);
        break;
      }

      const neighbors = this.getNeighbors(grid, current);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          const tentativeDistance = current.distance + 1;
          if (tentativeDistance < neighbor.distance) {
            neighbor.distance = tentativeDistance;
            neighbor.parent = current;
          }
        }
      }
    }

    return this.steps;
  }

  bfs(
    start: { row: number; col: number },
    end: { row: number; col: number },
    walls: { row: number; col: number }[]
  ): PathfindingStep[] {
    this.steps = [];
    const grid = this.createGrid(walls);
    const visited: { row: number; col: number }[] = [];
    const queue: GridCell[] = [grid[start.row][start.col]];

    grid[start.row][start.col].isVisited = true;
    this.addStep(grid, visited);

    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.push({ row: current.row, col: current.col });

      this.addStep(grid, visited, [{ row: current.row, col: current.col }]);

      if (current.row === end.row && current.col === end.col) {
        const path = this.reconstructPath(current);
        this.addStep(grid, visited, [], path);
        break;
      }

      const neighbors = this.getNeighbors(grid, current);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }

    return this.steps;
  }

  dfs(
    start: { row: number; col: number },
    end: { row: number; col: number },
    walls: { row: number; col: number }[]
  ): PathfindingStep[] {
    this.steps = [];
    const grid = this.createGrid(walls);
    const visited: { row: number; col: number }[] = [];
    const stack: GridCell[] = [grid[start.row][start.col]];

    this.addStep(grid, visited);

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (current.isVisited) continue;

      current.isVisited = true;
      visited.push({ row: current.row, col: current.col });

      this.addStep(grid, visited, [{ row: current.row, col: current.col }]);

      if (current.row === end.row && current.col === end.col) {
        const path = this.reconstructPath(current);
        this.addStep(grid, visited, [], path);
        break;
      }

      const neighbors = this.getNeighbors(grid, current);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.parent = current;
          stack.push(neighbor);
        }
      }
    }

    return this.steps;
  }

  getSteps(
    algorithm: string,
    start: { row: number; col: number },
    end: { row: number; col: number },
    walls: { row: number; col: number }[]
  ): PathfindingStep[] {
    switch (algorithm) {
      case 'dijkstra':
        return this.dijkstra(start, end, walls);
      case 'bfs':
        return this.bfs(start, end, walls);
      case 'dfs':
        return this.dfs(start, end, walls);
      default:
        return this.bfs(start, end, walls);
    }
  }
}
