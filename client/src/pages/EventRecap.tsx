import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Share2, Music, Users, Clock, Trophy } from 'lucide-react';
import { useAppUser } from '@/lib/auth';

export default function EventRecap() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user: appUser } = useAppUser();
  const event = useStore(state => state.events.find(e => e.id === eventId));
  const carols = useStore(state => state.carols);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const eventCarols = carols.filter(c => event.carols?.includes(c.id));
  const topSongs = eventCarols.sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);
  const totalVotes = eventCarols.reduce((sum: number, c) => sum + (c.votes || 0), 0);

  const handleShare = () => {
    const text = `🎵 We just celebrated ${event.name}! ${event.members.length} singers, ${topSongs.length} songs. Join us next time!`;
    if (navigator.share) {
      navigator.share({
        title: `${event.name} - Recap`,
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handlePlanNext = () => {
    // Pre-populate create modal with same theme
    navigate('/', { state: { prefillTheme: event.theme } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="font-display text-lg text-primary font-bold">Event Recap</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              {event.name}
            </h2>
            <p className="text-lg text-muted-foreground">
              What a celebration! Here's how it went.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Users, label: 'Singers', value: event.members?.length || 0 },
            { icon: Music, label: 'Songs Sung', value: eventCarols.length },
            { icon: Trophy, label: 'Total Votes', value: totalVotes },
            { icon: Clock, label: 'Duration', value: 'TBD' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
              >
                <Card className="p-6 text-center border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="font-display text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Songs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
                <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Most Loved Songs
                </h3>

                {topSongs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No songs were voted on yet. Check back after the event!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topSongs.map((carol, idx) => (
                      <motion.div
                        key={carol.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + idx * 0.05 }}
                        className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border-l-4 border-l-accent hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.05 }}
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white ${
                                idx === 0
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                  : idx === 1
                                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                    : 'bg-gradient-to-r from-orange-400 to-orange-500'
                              }`}
                            >
                              {idx + 1}
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-foreground">{carol.title}</p>
                              <p className="text-sm text-muted-foreground">{carol.artist}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-display text-2xl font-bold text-accent">
                              {carol.votes}
                            </p>
                            <p className="text-xs text-muted-foreground">votes</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* All Songs */}
            {eventCarols.length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8">
                  <h3 className="font-display text-2xl font-bold mb-6">
                    🎵 All {eventCarols.length} Songs
                  </h3>
                  <div className="space-y-2">
                    {eventCarols
                      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                      .map((carol) => (
                        <div key={carol.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/10 transition-colors">
                          <div>
                            <p className="font-semibold text-foreground">{carol.title}</p>
                            <p className="text-xs text-muted-foreground">{carol.artist}</p>
                          </div>
                          <span className="font-bold text-accent">{carol.votes} votes</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Attendees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="p-8">
                <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {event.members?.length || 0} Singers Were There
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Thank you for making this celebration special. See you next time!
                </p>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Member list coming soon 👥</p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white">
                <h3 className="font-display text-xl font-bold mb-4">Share the Joy!</h3>
                <p className="text-sm text-white/90 mb-4">
                  Tell your friends about this celebration.
                </p>
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Recap
                </Button>
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-6">
                <h3 className="font-display text-lg font-bold mb-4">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Theme</p>
                    <p className="font-bold">{event.theme}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-bold">{event.date.toLocaleDateString()}</p>
                  </div>
                  {event.venue && (
                    <div>
                      <p className="text-muted-foreground">Venue</p>
                      <p className="font-bold">{event.venue}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 border-accent/30 bg-accent/5">
                <h3 className="font-display text-lg font-bold mb-3">What's Next?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to gather the singers again?
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handlePlanNext}
                    className="w-full gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Plan Next Event
                  </Button>
                  <Button
                    onClick={() => navigate(`/events/${eventId}`)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Event
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
