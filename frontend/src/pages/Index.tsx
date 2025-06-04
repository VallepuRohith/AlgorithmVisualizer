
import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Shuffle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VisualizationCanvas } from '@/components/VisualizationCanvas';
import { GridCanvas } from '@/components/GridCanvas';
import { SortingAlgorithms } from '@/utils/sortingAlgorithms';
import { PathfindingAlgorithms } from '@/utils/pathfindingAlgorithms';

const Index = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [algorithmType, setAlgorithmType] = useState<'sorting' | 'pathfinding'>('sorting');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const isPlayingRef = useRef(false);

  // Pathfinding specific state
  const [grid, setGrid] = useState<any[][]>([]);
  const [start, setStart] = useState({ row: 5, col: 5 });
  const [end, setEnd] = useState({ row: 15, col: 25 });
  const [walls, setWalls] = useState<{ row: number; col: number }[]>([]);

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from(
      { length: arraySize }, 
      () => Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
  }, [arraySize]);

  const generateRandomWalls = useCallback(() => {
    const newWalls: { row: number; col: number }[] = [];
    const rows = 20;
    const cols = 30;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Don't place walls on start or end positions
        if ((row === start.row && col === start.col) || 
            (row === end.row && col === end.col)) {
          continue;
        }
        // 20% chance of wall
        if (Math.random() < 0.2) {
          newWalls.push({ row, col });
        }
      }
    }
    setWalls(newWalls);
  }, [start, end]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentStep(0);
    setSteps([]);
    setIsComplete(false);
    if (algorithmType === 'sorting') {
      setArray(prev => [...prev]); // Reset to original array
    } else {
      setGrid([]); // Reset grid
    }
  }, [algorithmType]);

  useEffect(() => {
    if (algorithmType === 'sorting') {
      generateRandomArray();
    } else {
      generateRandomWalls();
    }
    resetVisualization();
  }, [algorithmType, generateRandomArray, generateRandomWalls, resetVisualization]);

  const startVisualization = async () => {
    if (isComplete) {
      resetVisualization();
      return;
    }

    if (steps.length === 0) {
      // Generate steps if not already generated
      let algorithmSteps: any[] = [];

      if (algorithmType === 'sorting') {
        const sortingAlgorithm = new SortingAlgorithms();
        algorithmSteps = sortingAlgorithm.getSteps(algorithm, [...array]);
      } else {
        const pathfindingAlgorithm = new PathfindingAlgorithms(20, 30);
        algorithmSteps = pathfindingAlgorithm.getSteps(algorithm, start, end, walls);
      }

      setSteps(algorithmSteps);
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    // Continue from current step
    const stepsToUse = steps.length > 0 ? steps : (algorithmType === 'sorting' 
      ? new SortingAlgorithms().getSteps(algorithm, [...array])
      : new PathfindingAlgorithms(20, 30).getSteps(algorithm, start, end, walls));

    if (steps.length === 0) {
      setSteps(stepsToUse);
    }

    for (let i = currentStep; i < stepsToUse.length && isPlayingRef.current; i++) {
      setCurrentStep(i);
      
      if (algorithmType === 'sorting') {
        setArray([...stepsToUse[i].array]);
      } else {
        setGrid([...stepsToUse[i].grid]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 101 - speed));
    }

    if (isPlayingRef.current && currentStep >= stepsToUse.length - 1) {
      setIsComplete(true);
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const sortingAlgorithms = {
    bubble: 'Bubble Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    merge: 'Merge Sort',
    quick: 'Quick Sort'
  };

  const pathfindingAlgorithms = {
    bfs: 'Breadth-First Search',
    dfs: 'Depth-First Search',
    dijkstra: "Dijkstra's Algorithm"
  };

  const currentAlgorithms = algorithmType === 'sorting' ? sortingAlgorithms : pathfindingAlgorithms;

  // Update algorithm when switching types
  useEffect(() => {
    if (algorithmType === 'sorting') {
      setAlgorithm('bubble');
    } else {
      setAlgorithm('bfs');
    }
    resetVisualization();
  }, [algorithmType, resetVisualization]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Algorithm Visualizer
            </h1>
            <div className="flex items-center gap-4">
              <Select value={algorithmType} onValueChange={(value: 'sorting' | 'pathfinding') => setAlgorithmType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sorting">Sorting Algorithms</SelectItem>
                  <SelectItem value="pathfinding">Pathfinding Algorithms</SelectItem>
                </SelectContent>
              </Select>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentAlgorithms).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Controls</h3>
              
              {/* Action Buttons */}
              <div className="space-y-4 mb-6">
                <Button
                  onClick={isPlaying ? pauseVisualization : startVisualization}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  size="lg"
                  disabled={algorithmType === 'pathfinding' && walls.length === 0}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {isComplete ? 'Start New' : 'Start'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetVisualization}
                  variant="outline"
                  className="w-full border-purple-300 hover:bg-purple-50"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={algorithmType === 'sorting' ? generateRandomArray : generateRandomWalls}
                  variant="outline"
                  className="w-full border-blue-300 hover:bg-blue-50"
                  size="lg"
                  disabled={isPlaying}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {algorithmType === 'sorting' ? 'Generate New Array' : 'Generate New Maze'}
                </Button>
              </div>

              {/* Settings */}
              <div className="space-y-6">
                {algorithmType === 'sorting' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Array Size: {arraySize}
                    </label>
                    <Slider
                      value={[arraySize]}
                      onValueChange={(value) => setArraySize(value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={isPlaying}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Speed: {speed}%
                  </label>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
                <div className="space-y-2 text-xs">
                  {algorithmType === 'sorting' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Default</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Comparing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Sorted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Current</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Start</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>End</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        <span>Wall</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-300 rounded"></div>
                        <span>Visited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                        <span>Path</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span>Current</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-200 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentAlgorithms[algorithm as keyof typeof currentAlgorithms]}
                </h3>
                {steps.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                )}
              </div>
              
              {algorithmType === 'sorting' ? (
                <VisualizationCanvas
                  array={array}
                  comparing={steps[currentStep]?.comparing || []}
                  sorted={steps[currentStep]?.sorted || []}
                  current={steps[currentStep]?.current || []}
                />
              ) : (
                <GridCanvas
                  grid={grid.length > 0 ? grid : Array(20).fill(0).map(() => Array(30).fill(0).map((_, col) => ({ row: 0, col, isWall: false, isVisited: false, isPath: false, distance: 0 })))}
                  start={start}
                  end={end}
                  path={steps[currentStep]?.path || []}
                  visited={steps[currentStep]?.visited || []}
                  current={steps[currentStep]?.current || []}
                  walls={walls}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
