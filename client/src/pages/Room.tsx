import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { VoteCard } from '@/components/VoteCard';
import { LyricsModal } from '@/components/LyricsModal';
import { Countdown } from '@/components/Countdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Gift, MessageSquare, Music, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAppUser, getCurrentUserId } from '@/lib/auth';
import { type Carol } from '@shared/schema';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export default function Room() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useStore(state => state.events.find(e => e.id === eventId));
  const carols = useStore(state => state.carols);
  const voteForCarol = useStore(state => state.voteForCarol);
  const addMessage = useStore(state => state.addMessage);
  const addContribution = useStore(state => state.addContribution);

  const { user: appUser } = useAppUser();
  const currentUserId = getCurrentUserId(appUser);

  const [messageText, setMessageText] = useState('');
  const [contributionText, setContributionText] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'details' | 'chat' | 'contributions'>('songs');
  const [showTooltips, setShowTooltips] = useState(() => {
    // Show tooltips only for first-time users
    return localStorage.getItem('carolers_tooltips_seen') !== 'true';
  });
  const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);

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

  const eventCarols = carols.filter(c => event.carols.includes(c.id));

  const handleVote = (carolId: string) => {
    voteForCarol(event.id, carolId);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      addMessage(event.id, {
        eventId: event.id,
        memberId: currentUserId,
        text: messageText
      });
      setMessageText('');
    }
  };

  const handleAddContribution = () => {
    if (contributionText.trim()) {
      addContribution(event.id, {
        eventId: event.id,
        memberId: currentUserId,
        item: contributionText,
        status: 'proposed'
      });
      setContributionText('');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="font-display text-2xl text-primary font-bold">{event.name}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${eventId}/recap`)}
          >
            View Recap
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Event Header with Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-8 mb-8 border border-primary/30"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">{event.name}</h2>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              <div className="space-y-2 text-sm">
                {event.venue && <p>📍 <strong>Venue:</strong> {event.venue}</p>}
                <p>👥 <strong>Members:</strong> {event.members.length} people</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Countdown targetDate={event.date} label="Event Starts" />
            </div>
          </div>
        </motion.div>

        {/* Tabs with Tooltips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 sticky top-20 bg-background z-30">
          {[
            { id: 'songs', label: 'Vote on Songs', icon: Music, 
              tooltip: 'Vote on your favorite carols for the group to sing together' },
            { id: 'details', label: 'Event Details',
              tooltip: 'View event information, date, time, location and prepare for the celebration' },
            { id: 'contributions', label: 'Bring Something', icon: Gift,
              tooltip: 'Coordinate what everyone brings - food, decorations, song sheets, etc.' },
            { id: 'chat', label: 'Group Chat', icon: MessageSquare,
              tooltip: 'Connect with fellow singers, discuss songs, and build excitement' }
          ].map((tab) => (
            <Tooltip key={tab.id} open={showTooltips} onOpenChange={(open) => {
              if (!open && showTooltips) {
                setShowTooltips(false);
                localStorage.setItem('carolers_tooltips_seen', 'true');
              }
            }}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === tab.id ? 'default' : 'secondary'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </Button>
              </TooltipTrigger>
              {showTooltips && tab.tooltip && (
                <TooltipContent side="bottom" align="center">
                  <div className="flex items-center gap-2">
                    {tab.icon && <span className="text-xs">{React.createElement(tab.icon, { className: 'w-3 h-3' })}</span>}
                    <span>{tab.tooltip}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'songs' && (
              <motion.div className="space-y-4">
                <h3 className="font-display text-2xl font-bold mb-4">Vote for Your Favorite Songs</h3>
                {carols.map(carol => (
                  <VoteCard
                    key={carol.id}
                    carol={carol}
                    voted={event.carols.includes(carol.id)}
                    onVote={() => handleVote(carol.id)}
                    onViewLyrics={() => {
                      setSelectedCarol(carol);
                      setLyricsModalOpen(true);
                    }}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div className="space-y-6">
                {/* Event Basics */}
                <Card className="p-6 border-primary/30 bg-primary/5">
                  <h3 className="font-display text-xl font-bold mb-4">Event Details</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-bold text-lg">{event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Venue</p>
                      <p className="font-bold text-lg">{event.venue || 'Location TBD'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Members Joining</p>
                      <p className="font-bold text-lg">{event.members.length} people</p>
                    </div>
                  </div>
                </Card>

                {/* Theme Context - Prep Guide */}
                <Card className="p-6 border-accent/30 bg-accent/5">
                  <h3 className="font-display text-xl font-bold mb-4">🎄 About This Celebration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {event.theme === 'Christmas'
                      ? 'Christmas carols celebrate the joy and spirit of the season. These traditional and modern songs bring warmth and festivity to gatherings.'
                      : event.theme === 'Hanukkah'
                        ? 'Hanukkah songs honor the Festival of Lights, celebrating resilience and renewal. These melodies span from ancient traditions to contemporary celebrations.'
                        : event.theme === 'Easter'
                          ? 'Easter hymns and songs capture themes of renewal, hope, and celebration across many traditions.'
                          : 'Celebrate together with songs that bring communities, families, and friends closer.'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs bg-white/50 dark:bg-black/20 font-medium">
                      Theme: {event.theme}
                    </span>
                    {event.theme === 'Christmas' && (
                      <span className="px-3 py-1 rounded-full text-xs bg-white/50 dark:bg-black/20 font-medium">
                        🎵 All voice types welcome
                      </span>
                    )}
                  </div>
                </Card>

                {/* Song Previews & Preparation */}
                <Card className="p-6">
                  <h3 className="font-display text-xl font-bold mb-4">🎵 Songs You'll Sing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review these songs before the event. Tap "View Lyrics" to learn them!
                  </p>
                  <div className="space-y-3">
                    {eventCarols.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">
                        No songs voted yet. Head to the "Vote on Songs" tab to pick your favorites!
                      </p>
                    ) : (
                      eventCarols.sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((carol, idx) => (
                        <div
                          key={carol.id}
                          className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 hover:border-secondary/60 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCarol(carol);
                            setLyricsModalOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-display text-lg font-bold text-accent">#{idx + 1}</span>
                                <p className="font-bold text-sm">{carol.title}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{carol.artist}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-accent font-bold">{carol.votes || 0} votes</p>
                              <p className="text-xs text-muted-foreground">{carol.duration}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                carol.energy === 'high'
                                  ? 'bg-accent/20 text-accent'
                                  : carol.energy === 'medium'
                                    ? 'bg-secondary/20 text-secondary'
                                    : 'bg-primary/20 text-primary'
                              }`}
                            >
                              {carol.energy} energy
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              📖 View Lyrics
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Vocal Range Guide */}
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <h3 className="font-display text-lg font-bold mb-3">🎤 Vocal Range Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Everyone can sing! Here's a guide to find your part:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                      <p className="font-bold">Soprano (Highest)</p>
                      <p className="text-xs text-muted-foreground">Lead melody, bright and soaring</p>
                    </div>
                    <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                      <p className="font-bold">Alto (Mid-high)</p>
                      <p className="text-xs text-muted-foreground">Harmony, warm and supporting</p>
                    </div>
                    <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                      <p className="font-bold">Tenor (Mid-low)</p>
                      <p className="text-xs text-muted-foreground">Harmony, bright and full</p>
                    </div>
                    <div className="p-2 rounded bg-white/50 dark:bg-black/20">
                      <p className="font-bold">Bass (Lowest)</p>
                      <p className="text-xs text-muted-foreground">Foundation, deep and grounding</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'contributions' && (
              <motion.div className="space-y-6">
                <Card className="p-6 border-primary/30 bg-primary/5">
                  <h3 className="font-display text-xl font-bold mb-4">Propose a Contribution</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="E.g., 'Hot cocoa for everyone', 'Cookies & candy canes'..."
                      value={contributionText}
                      onChange={(e) => setContributionText(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <Button onClick={handleAddContribution} className="w-full gap-2">
                      <Gift className="w-4 h-4" />
                      Propose Item
                    </Button>
                  </div>
                </Card>

                <div>
                  <h3 className="font-display text-xl font-bold mb-4">Contributions</h3>
                  <div className="space-y-3">
                    {event.contributions.length === 0 ? (
                      <div className="text-center py-8 px-4 border-2 border-dashed border-muted/30 rounded-lg bg-muted/10">
                        <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎁</span>
                        </div>
                        <h4 className="font-semibold text-primary mb-1">No contributions yet</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Be the first to suggest what to bring!
                        </p>
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-xs text-left max-w-xs mx-auto">
                          <p className="text-muted-foreground mb-1">Suggest:</p>
                          <ul className="text-primary space-y-1">
                            <li>• Hot cocoa & cookies</li>
                            <li>• Song sheets & lyrics</li>
                            <li>• Festive decorations</li>
                            <li>• Camera for memories</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      event.contributions.map(contrib => (
                        <Card key={contrib.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{contrib.item}</p>
                            <p className="text-xs text-muted-foreground">Proposed by Member {contrib.memberId}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            contrib.status === 'confirmed' ? 'bg-accent/20 text-accent' :
                            contrib.status === 'brought' ? 'bg-green-500/20 text-green-600' :
                            'bg-orange-500/20 text-orange-600'
                          }`}>
                            {contrib.status.charAt(0).toUpperCase() + contrib.status.slice(1)}
                          </span>
                        </div>
                      </Card>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div className="space-y-6">
                <Card className="p-6 h-96 overflow-y-auto bg-secondary/5 flex flex-col justify-end">
                  <div className="space-y-3">
                    {event.messages.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl">💬</span>
                        </div>
                        <h4 className="font-semibold text-primary mb-1">No messages yet</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Be the first to start the conversation!
                        </p>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-left max-w-xs mx-auto">
                          <p className="text-muted-foreground mb-1">Example:</p>
                          <p className="text-primary">"I'm so excited for our caroling event! What's everyone's favorite holiday song? 🎄🎵"</p>
                        </div>
                      </div>
                    ) : (
                      event.messages.map(msg => (
                        <div key={msg.id} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <p className="text-xs text-muted-foreground font-bold mb-1">Member {msg.memberId}</p>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Share a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="h-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <Card className="p-6 sticky top-32">
              <h3 className="font-display text-lg font-bold mb-4">Event Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Songs</span>
                  <span className="font-bold">{eventCarols.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Votes</span>
                  <span className="font-bold">{eventCarols.reduce((sum: number, c) => sum + (c.votes || 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contributions</span>
                  <span className="font-bold">{event.contributions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="font-bold">{event.messages.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Lyrics Modal */}
      <LyricsModal
        carol={selectedCarol}
        isOpen={lyricsModalOpen}
        onClose={() => {
          setLyricsModalOpen(false);
          setSelectedCarol(null);
        }}
      />
    </div>
      </TooltipProvider>
  );
}
