import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Activity, Apple, Sparkles, Brain, Shield, BookOpen, ArrowRight, Calendar, Clock, User } from "lucide-react";
import logo from "@/assets/logo.png";

const blogPosts = [
  {
    slug: "how-to-reduce-heart-attack-risk",
    title: "How to Reduce Heart Attack Risk: Precautions, Lifestyle Tips, and More",
    summary:
      "Practical, evidence-backed steps to lower heart attack risk through daily habits, routine checks, and smart nutrition.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Heart Health", "Prevention", "Lifestyle"],
    category: "Heart Health",
  },
  {
    slug: "how-to-reduce-body-fat-and-lose-weight",
    title: "How to Reduce Body Fat and Lose Weight: Tips, Precautions, and Healthy Habits",
    summary:
      "Sustainable, science-backed ways to lower body fat, protect your heart, and avoid crash diets.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "7 min read",
    tags: ["Weight Loss", "Nutrition", "Fitness"],
    category: "Fitness & Exercise",
  },
  {
    slug: "the-hidden-dangers-of-smoking",
    title: "The Hidden Dangers of Smoking: What You Should Know",
    summary:
      "How smoking harms your heart, lungs, and overall health—and practical steps to quit for good.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Smoking", "Prevention", "Lung Health"],
    category: "Heart Health",
  },
  {
    slug: "understanding-high-sugar-levels",
    title: "Understanding High Sugar Levels: Causes and How to Reduce Them",
    summary:
      "What drives high blood sugar, why it matters for heart and metabolic health, and practical steps to bring it down safely.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "7 min read",
    tags: ["Blood Sugar", "Diabetes Prevention", "Nutrition"],
    category: "Nutrition",
  },
  {
    slug: "the-hidden-risks-of-over-exercising",
    title: "The Hidden Risks of Over-Exercising: What Can Go Wrong",
    summary:
      "Why too much training can backfire—signs of overtraining, common mistakes, and how to balance effort with recovery.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Fitness", "Recovery", "Overtraining"],
    category: "Fitness & Exercise",
  },
  {
    slug: "when-should-you-exercise",
    title: "When Should You Exercise—and When Should You Avoid It",
    summary:
      "How to time your workouts for safety and effectiveness—and when rest or medical clearance is the smarter choice.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Fitness", "Safety", "Recovery"],
    category: "Fitness & Exercise",
  },
  {
    slug: "is-caffeine-harmful",
    title: "Is Caffeine Harmful to Humans? Here's What You Need to Know",
    summary:
      "Balanced look at caffeine benefits, risks, safe intake ranges, and who should be cautious.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Caffeine", "Heart Health", "Sleep"],
    category: "Heart Health",
  },
  {
    slug: "how-to-live-a-healthy-life",
    title: "How to Live a Healthy Life: Daily Habits for Long-Term Wellness",
    summary:
      "Daily movement, nourishing food, solid sleep, and stress care—the habits that compound into lifelong health.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Wellness", "Lifestyle", "Heart Health"],
    category: "Wellness & Lifestyle",
  },
  {
    slug: "natural-antibiotic-foods",
    title: "Must-Have Natural Antibiotic Foods to Include in Your Diet",
    summary:
      "Foods with antimicrobial and immune-supporting properties—and how to use them safely alongside medical care.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Nutrition", "Immune Health", "Wellness"],
    category: "Nutrition",
  },
  {
    slug: "hydration-biology-liver-metabolism",
    title: "Hydration Biology & Liver Metabolism — Scientific Drinks That Support Hepatic Function in Summer",
    summary:
      "Hydration strategies and low-sugar electrolyte options to support liver function and metabolic balance in hot weather.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Liver Health", "Hydration", "Electrolytes"],
    category: "Nutrition",
  },
  {
    slug: "maternal-child-health-systems",
    title: "Maternal–Child Health Systems — Building Strong Foundations for Lifelong Wellness",
    summary:
      "Pillars of prenatal-to-postnatal care, skilled birth support, immunization, and community links that help mothers and babies thrive.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Maternal Health", "Child Health", "Prevention"],
    category: "Prevention & Awareness",
  },
  {
    slug: "hidden-brain-signals-tumour-clues",
    title: "Hidden Signals From the Brain: Early Neurological Clues That May Indicate a Tumour",
    summary:
      "Subtle neurological changes—headaches, vision shifts, speech or balance issues—that should prompt medical evaluation.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Neurology", "Brain Tumour", "Awareness"],
    category: "Prevention & Awareness",
  },
  {
    slug: "yoga-surprising-benefits",
    title: "When the Body Speaks and Science Listens: 6 Surprising Benefits of Yoga",
    summary:
      "Science-backed benefits of yoga—from heart health and stress reduction to improved flexibility and mental clarity.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Yoga", "Wellness", "Mental Health"],
    category: "Mental Health",
  },
];

const categories = [
  { name: "All", icon: BookOpen, count: blogPosts?.length ?? 0 },
  { name: "Heart Health", icon: Heart, count: blogPosts?.filter((p) => p?.category === "Heart Health")?.length ?? 0 },
  { name: "Fitness & Exercise", icon: Activity, count: blogPosts?.filter((p) => p?.category === "Fitness & Exercise")?.length ?? 0 },
  { name: "Nutrition", icon: Apple, count: blogPosts?.filter((p) => p?.category === "Nutrition")?.length ?? 0 },
  { name: "Wellness & Lifestyle", icon: Sparkles, count: blogPosts?.filter((p) => p?.category === "Wellness & Lifestyle")?.length ?? 0 },
  { name: "Mental Health", icon: Brain, count: blogPosts?.filter((p) => p?.category === "Mental Health")?.length ?? 0 },
  { name: "Prevention & Awareness", icon: Shield, count: blogPosts?.filter((p) => p?.category === "Prevention & Awareness")?.length ?? 0 },
];

// Category color mapping
const getCategoryColor = (category) => {
  const colorMap = {
    "Heart Health": "from-red-500/20 to-orange-500/20",
    "Fitness & Exercise": "from-blue-500/20 to-cyan-500/20",
    "Nutrition": "from-green-500/20 to-emerald-500/20",
    "Wellness & Lifestyle": "from-purple-500/20 to-pink-500/20",
    "Mental Health": "from-indigo-500/20 to-blue-500/20",
    "Prevention & Awareness": "from-teal-500/20 to-cyan-500/20",
  };
  return colorMap[category] ?? "from-accent/20 to-primary/20";
};

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = useMemo(
    () =>
      selectedCategory === "All"
        ? blogPosts ?? []
        : blogPosts?.filter((post) => post?.category === selectedCategory) ?? [],
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header Section - Dark Theme */}
      <section className="relative bg-gradient-to-br from-primary via-accent to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <BookOpen className="w-4 h-4" />
                Health & Wellness Insights
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                From Insight to <span className="text-accent-foreground">Impact</span>
                <br />
                <span className="text-white/90">Our Health Blog</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                Discover evidence-based articles, preventive health guidance, and wellness insights designed to help you make informed decisions for a healthier tomorrow.
              </p>
            </div>

            {/* Right: Decorative Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Gradient Orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-warning/30 rounded-full blur-3xl"></div>
                
                {/* Abstract Health Visualization */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10"
                      >
                        <Heart className="w-6 h-6 text-white/40" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-white/60">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">AI-Powered Health Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Section - Light Theme */}
      <section className="bg-white dark:bg-card border-b border-border sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((category) => {
              const { name, icon: Icon, count } = category;
              const isActive = selectedCategory === name;
              return (
                <Button
                  key={name}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(name)}
                  className={`flex-shrink-0 whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                      : "hover:bg-accent/10 hover:border-accent/50 bg-white dark:bg-card"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {name}
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={`ml-2 ${
                      isActive ? "bg-accent-foreground/10" : ""
                    }`}
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">No blogs found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const { slug, category, date, readTime, title, summary, tags, author } = post ?? {};
              const postSlug = slug ?? "";
              const postCategory = category ?? "";
              const postDate = date ?? "";
              const postReadTime = readTime ?? "";
              const postTitle = title ?? "";
              const postSummary = summary ?? "";
              const postTags = tags ?? [];
              const postAuthor = author ?? "";
              
              return (
                <article
                  key={postSlug}
                  className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Header with Gradient */}
                  <div className={`relative h-48 bg-gradient-to-br ${getCategoryColor(postCategory)} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-50" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20H20v0.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zM0 24h20v2H0v-2zm0 4h20v2H0v-2zm0 4h20v2H0v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                    
                    {/* Category Badge - Left Side */}
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-white/90 dark:bg-card/90 text-foreground backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white dark:hover:bg-card transition-colors">
                        {postCategory}
                      </Badge>
                    </div>

                    {/* Logo - Right Side */}
                    <div className="absolute top-4 right-4 z-20">
                      <img
                        src={logo}
                        alt="10000Hearts Logo"
                        className="h-10 md:h-12 w-auto opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                      />
                    </div>

                    {/* Icon Overlay */}
                    <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                      {postCategory === "Heart Health" && <Heart className="w-16 h-16 text-white" />}
                      {postCategory === "Fitness & Exercise" && <Activity className="w-16 h-16 text-white" />}
                      {postCategory === "Nutrition" && <Apple className="w-16 h-16 text-white" />}
                      {postCategory === "Wellness & Lifestyle" && <Sparkles className="w-16 h-16 text-white" />}
                      {postCategory === "Mental Health" && <Brain className="w-16 h-16 text-white" />}
                      {postCategory === "Prevention & Awareness" && <Shield className="w-16 h-16 text-white" />}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{postDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{postReadTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-card-foreground leading-tight group-hover:text-accent transition-colors line-clamp-2">
                      {postTitle}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {postSummary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {postTags.slice(0, 2).map((tag) => (
                        <Badge key={tag ?? ""} variant="secondary" className="text-xs">
                          {tag ?? ""}
                        </Badge>
                      ))}
                      {(postTags?.length ?? 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(postTags?.length ?? 0) - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{postAuthor}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="group/btn hover:bg-accent hover:text-accent-foreground"
                      >
                        <Link to={`/blogs/${postSlug}`} aria-label={`Read ${postTitle}`}>
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;
