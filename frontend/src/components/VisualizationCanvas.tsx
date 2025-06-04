
interface VisualizationCanvasProps {
  array: number[];
  comparing?: number[];
  sorted?: number[];
  current?: number[];
}

export const VisualizationCanvas = ({ 
  array, 
  comparing = [], 
  sorted = [], 
  current = [] 
}: VisualizationCanvasProps) => {
  const maxValue = Math.max(...array);
  const containerHeight = 400;

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return 'bg-green-500';
    if (comparing.includes(index)) return 'bg-red-500';
    if (current.includes(index)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getBarHeight = (value: number) => {
    return (value / maxValue) * containerHeight;
  };

  return (
    <div className="w-full h-full flex items-end justify-center gap-1 p-4 overflow-hidden">
      {array.map((value, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ease-in-out rounded-t-sm ${getBarColor(index)} relative group`}
          style={{
            height: `${getBarHeight(value)}px`,
            width: `${Math.max(800 / array.length - 2, 4)}px`,
            minWidth: '2px'
          }}
        >
          {/* Value label on hover */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {value}
          </div>
          
          {/* Index label for smaller arrays */}
          {array.length <= 50 && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
              {index}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
