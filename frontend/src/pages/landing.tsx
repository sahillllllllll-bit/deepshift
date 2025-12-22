import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Zap, 
  Trophy, 
  Users, 
  ArrowRight, 
  Brain, 
  Globe, 
  Code, 
  Rocket,
  CheckCircle,
  IndianRupee,
  Star,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const contestTypes = [
  {
    id: "aptitude",
    icon: Brain,
    title: "Aptitude Tests",
    description: "Test your logical reasoning, quantitative aptitude, and analytical skills.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "gk",
    icon: Globe,
    title: "General Knowledge",
    description: "Challenge yourself with current affairs, history, science, and more.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10"
  },
  {
    id: "coding",
    icon: Code,
    title: "Coding Contests",
    description: "Solve algorithmic problems and showcase your programming skills.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  {
    id: "hackathon",
    icon: Rocket,
    title: "Hackathons",
    description: "Build innovative projects and compete for exciting prizes.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10"
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Register",
    description: "Create your free account in seconds and complete your profile."
  },
  {
    step: "02",
    title: "Join Contests",
    description: "Browse available contests, pay the entry fee, and get ready to compete."
  },
  {
    step: "03",
    title: "Win Prizes",
    description: "Score high, climb the leaderboard, and win exciting cash prizes!"
  }
];

const mockWinners = [
  { id: 1, name: "Arjun Sharma", college: "IIT Delhi", prize: 25000, rank: 1, avatar: null },
  { id: 2, name: "Priya Patel", college: "NIT Trichy", prize: 15000, rank: 2, avatar: null },
  { id: 3, name: "Rahul Kumar", college: "BITS Pilani", prize: 10000, rank: 3, avatar: null },
  { id: 4, name: "Sneha Reddy", college: "IIT Bombay", prize: 5000, rank: 4, avatar: null }
];

const mockContests = [
  {
    id: "1",
    title: "Aptitude Challenge 2024",
    category: "aptitude",
    prize: 50000,
    fee: 99,
    participants: 234,
    status: "upcoming"
  },
  {
    id: "2",
    title: "Code Sprint Finals",
    category: "coding",
    prize: 100000,
    fee: 199,
    participants: 156,
    status: "live"
  },
  {
    id: "3",
    title: "GK Master Quiz",
    category: "gk",
    prize: 25000,
    fee: 49,
    participants: 312,
    status: "upcoming"
  },
  {
    id: "4",
    title: "Innovation Hackathon",
    category: "hackathon",
    prize: 200000,
    fee: 499,
    participants: 89,
    status: "upcoming"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[90svh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
                {/* <Zap className="w-3 h-3 mr-1" />. */}
                <Brain className="w-3 h-3 mr-1" />
                India's #1 Skill-Based Contest Platform
              </Badge>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              variants={fadeInUp}
              data-testid="text-hero-title"
            >
              Compete. Conquer.
              <br />
              <span className="text-primary">Win Big.</span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              variants={fadeInUp}
            >
              Join thousands of students competing in aptitude tests, coding contests, 
              and hackathons. Win cash prizes and prove your skills!
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Join Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Admin Login
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
              variants={fadeInUp}
            >
              {[
                { value: "2,000+", label: "Active Students" },
                { value: "Rs 10L+", label: "Prize Pool" },
                { value: "500+", label: "Contests Held" },
                { value: "98%", label: "Satisfaction" }
              ].map((stat, idx) => (
                <Card key={idx} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 md:p-6 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started in three simple steps and begin your journey to winning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/signup">
                  <Card className="h-full text-center hover-elevate cursor-pointer">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-primary">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contest Types */}
      <section id="contests" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Contest Categories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choose from a variety of contest types that match your skills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contestTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/signup">
                  <Card className="h-full hover-elevate cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-4`}>
                        <type.icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section id="winners" className="py-16 md:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Recent Winners</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Celebrating our top performers who proved their skills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockWinners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/signup">
                  <Card className={`relative overflow-visible cursor-pointer ${index === 0 ? 'ring-2 ring-yellow-500/50' : ''}`}>
                    {index === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-yellow-500 text-yellow-950 border-yellow-400">
                          <Trophy className="w-3 h-3 mr-1" />
                          Champion
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20">
                        <AvatarImage src={winner.avatar || undefined} />
                        <AvatarFallback className="text-xl font-semibold bg-primary/10">
                          {winner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{winner.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{winner.college}</p>
                      <div className="flex items-center justify-center gap-1 text-xl font-bold text-primary">
                        <IndianRupee className="w-5 h-5" />
                        <span>{winner.prize.toLocaleString()}</span>
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        Rank #{winner.rank}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Contests */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Featured Contests</h2>
              <p className="text-muted-foreground">
                Browse our current and upcoming contests
              </p>
            </div>
            <Link href="/signup">
              <Button variant="outline">
                View All Contests
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockContests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href="/signup">
                  <Card className="h-full hover-elevate cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant="outline"
                          className={
                            contest.category === "coding" ? "text-purple-400 border-purple-500/30" :
                            contest.category === "aptitude" ? "text-blue-400 border-blue-500/30" :
                            contest.category === "gk" ? "text-emerald-400 border-emerald-500/30" :
                            "text-orange-400 border-orange-500/30"
                          }
                        >
                          {contest.category.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${contest.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                          <span className="text-xs text-muted-foreground capitalize">{contest.status}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-3">{contest.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Prize Pool</span>
                          <span className="font-semibold text-primary flex items-center">
                            <IndianRupee className="w-3 h-3" />
                            {contest.prize.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Entry Fee</span>
                          <span className="flex items-center">
                            <IndianRupee className="w-3 h-3" />
                            {contest.fee}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Participants</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {contest.participants}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
      {/* Creator CTA */}
      {/* <section id="creators" className="py-16 md:py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="w-3 h-3 mr-1" />
                Creator Program
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Become a Creator & Earn Money
              </h2>
              <p className="text-muted-foreground mb-8">
                Join our affiliate program and earn commissions by referring students 
                to our contests. It's free to join and you can start earning immediately!
              </p>
              <ul className="space-y-3 mb-8">
                {creatorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/creator/signup">
                <Button size="lg" data-testid="button-creator-signup">
                  Become a Creator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Creator Benefits</h3>
                    <p className="text-muted-foreground text-sm">
                      Here's what our top creators are earning
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Avg. Monthly Earnings</span>
                      <span className="font-bold text-primary flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        15,000+
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Commission per Referral</span>
                      <span className="font-bold flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        10-50
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Min. Withdrawal</span>
                      <span className="font-bold flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        300
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section> */}
