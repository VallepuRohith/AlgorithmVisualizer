
interface GridCanvasProps {
  grid: GridCell[][];
  start: { row: number; col: number };
  end: { row: number; col: number };
  path: { row: number; col: number }[];
  visited: { row: number; col: number }[];
  current: { row: number; col: number }[];
  walls: { row: number; col: number }[];
}

interface GridCell {
  row: number;
  col: number;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
}

export const GridCanvas = ({
  grid,
  start,
  end,
  path,
  visited,
  current,
  walls
}: GridCanvasProps) => {
  const getCellColor = (row: number, col: number) => {
    if (row === start.row && col === start.col) return 'bg-green-500';
    if (row === end.row && col === end.col) return 'bg-red-500';
    if (path.some(p => p.row === row && p.col === col)) return 'bg-yellow-400';
    if (current.some(c => c.row === row && c.col === col)) return 'bg-purple-500';
    if (visited.some(v => v.row === row && v.col === col)) return 'bg-blue-300';
    if (walls.some(w => w.row === row && w.col === col)) return 'bg-gray-800';
    return 'bg-gray-100';
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div 
        className="grid gap-[1px] border border-gray-300"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)`,
          maxWidth: '600px',
          maxHeight: '400px'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-4 h-4 transition-all duration-200 ${getCellColor(rowIndex, colIndex)}`}
              style={{
                minWidth: '8px',
                minHeight: '8px'
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
