import { useState, useEffect } from 'react';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getCarols } from '@/lib/carols';

interface CarolPlayerProps {
  event: Event;
}

export function CarolPlayer({ event }: CarolPlayerProps) {
  const [carols, setCarols] = useState<any[]>([]);
  const [currentCarol, setCurrentCarol] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchCarols() {
      const allCarols = await getCarols();
      const eventCarols = event.carols?.map(id => allCarols.find(c => c.id === id)).filter(Boolean) || [];
      setCarols(eventCarols);
    }

    fetchCarols();
  }, [event.carols]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentCarol) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 200); // Update every 200ms (assuming a 20 second carol)
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentCarol]);

  const playCarol = (carol: any) => {
    setCurrentCarol(carol);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayer = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sing Along</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentCarol ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentCarol.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentCarol.artist}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={resetPlayer}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Lyrics</h4>
                <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                  {currentCarol.lyrics?.map((line: string, idx: number) => (
                    <p key={idx} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a carol to start playing</p>
          )}

          <div className="mt-4">
            <h4 className="font-medium mb-2">Event Playlist</h4>
            <div className="space-y-2">
              {carols.map((carol) => (
                <div 
                  key={carol.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentCarol?.id === carol.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => playCarol(carol)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{carol.title}</p>
                      <p className="text-sm text-muted-foreground">{carol.artist}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{carol.votes} votes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}