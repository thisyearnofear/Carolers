import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </CardFooter>
    </Card>
  );
}