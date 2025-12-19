import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { VoteCard } from '@/components/VoteCard';
import { Countdown } from '@/components/Countdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send, Gift, MessageSquare, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function Room() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useStore(state => state.events.find(e => e.id === eventId));
  const carols = useStore(state => state.carols);
  const voteForCarol = useStore(state => state.voteForCarol);
  const addMessage = useStore(state => state.addMessage);
  const addContribution = useStore(state => state.addContribution);

  const [messageText, setMessageText] = useState('');
  const [contributionText, setContributionText] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'details' | 'chat' | 'contributions'>('songs');

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
        memberId: 'user1',
        text: messageText
      });
      setMessageText('');
    }
  };

  const handleAddContribution = () => {
    if (contributionText.trim()) {
      addContribution(event.id, {
        memberId: 'user1',
        item: contributionText,
        status: 'proposed'
      });
      setContributionText('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="font-display text-2xl text-primary font-bold">{event.name}</h1>
          <div className="w-20" />
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 sticky top-20 bg-background z-30">
          {[
            { id: 'songs', label: 'Vote on Songs', icon: Music },
            { id: 'details', label: 'Event Details' },
            { id: 'contributions', label: 'Bring Something', icon: Gift },
            { id: 'chat', label: 'Group Chat', icon: MessageSquare }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'secondary'}
              onClick={() => setActiveTab(tab.id as any)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
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
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Event Information</h3>
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

                <Card className="p-6">
                  <h3 className="font-display text-xl font-bold mb-4">Top Songs</h3>
                  <div className="space-y-2">
                    {eventCarols.sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((carol, idx) => (
                      <div key={carol.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10">
                        <span className="font-display text-lg font-bold text-accent">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-sm">{carol.title}</p>
                          <p className="text-xs text-muted-foreground">{carol.votes} votes</p>
                        </div>
                      </div>
                    ))}
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
                    {event.contributions.map(contrib => (
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
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div className="space-y-6">
                <Card className="p-6 h-96 overflow-y-auto bg-secondary/5 flex flex-col justify-end">
                  <div className="space-y-3">
                    {event.messages.length === 0 ? (
                      <p className="text-muted-foreground text-center text-sm">No messages yet. Start the conversation!</p>
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
    </div>
  );
}
