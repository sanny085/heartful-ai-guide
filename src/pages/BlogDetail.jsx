import { useMemo, useCallback, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, Heart, Activity, Apple, Sparkles, Brain, Shield, BookOpen, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";
import HeartAttackBlog from "./blogs/how-to-reduce-heart-attack-risk.mdx";
import WeightLossBlog from "./blogs/how-to-reduce-body-fat-and-lose-weight.mdx";
import SmokingBlog from "./blogs/the-hidden-dangers-of-smoking.mdx";
import SugarBlog from "./blogs/understanding-high-sugar-levels.mdx";
import OverExercisingBlog from "./blogs/the-hidden-risks-of-over-exercising.mdx";
import WhenExerciseBlog from "./blogs/when-should-you-exercise.mdx";
import CaffeineBlog from "./blogs/is-caffeine-harmful.mdx";
import HealthyLifeBlog from "./blogs/how-to-live-a-healthy-life.mdx";
import NaturalAntibioticFoodsBlog from "./blogs/natural-antibiotic-foods.mdx";
import HydrationLiverBlog from "./blogs/hydration-biology-liver-metabolism.mdx";
import MaternalChildHealthBlog from "./blogs/maternal-child-health-systems.mdx";
import BrainSignalsTumourBlog from "./blogs/hidden-brain-signals-tumour-clues.mdx";
import YogaBenefitsBlog from "./blogs/yoga-surprising-benefits.mdx";

// Blog posts data
const blogPosts = [
  {
    slug: "how-to-reduce-heart-attack-risk",
    title: "How to Reduce Heart Attack Risk: Precautions, Lifestyle Tips, and More",
    summary: "Practical, evidence-backed steps to lower heart attack risk through daily habits, routine checks, and smart nutrition.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Heart Health", "Prevention", "Lifestyle"],
    category: "Heart Health",
  },
  {
    slug: "how-to-reduce-body-fat-and-lose-weight",
    title: "How to Reduce Body Fat and Lose Weight: Tips, Precautions, and Healthy Habits",
    summary: "Sustainable, science-backed ways to lower body fat, protect your heart, and avoid crash diets.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "7 min read",
    tags: ["Weight Loss", "Nutrition", "Fitness"],
    category: "Fitness & Exercise",
  },
  {
    slug: "the-hidden-dangers-of-smoking",
    title: "The Hidden Dangers of Smoking: What You Should Know",
    summary: "How smoking harms your heart, lungs, and overall health—and practical steps to quit for good.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Smoking", "Prevention", "Lung Health"],
    category: "Heart Health",
  },
  {
    slug: "understanding-high-sugar-levels",
    title: "Understanding High Sugar Levels: Causes and How to Reduce Them",
    summary: "What drives high blood sugar, why it matters for heart and metabolic health, and practical steps to bring it down safely.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "7 min read",
    tags: ["Blood Sugar", "Diabetes Prevention", "Nutrition"],
    category: "Nutrition",
  },
  {
    slug: "the-hidden-risks-of-over-exercising",
    title: "The Hidden Risks of Over-Exercising: What Can Go Wrong",
    summary: "Why too much training can backfire—signs of overtraining, common mistakes, and how to balance effort with recovery.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Fitness", "Recovery", "Overtraining"],
    category: "Fitness & Exercise",
  },
  {
    slug: "when-should-you-exercise",
    title: "When Should You Exercise—and When Should You Avoid It",
    summary: "How to time your workouts for safety and effectiveness—and when rest or medical clearance is the smarter choice.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Fitness", "Safety", "Recovery"],
    category: "Fitness & Exercise",
  },
  {
    slug: "is-caffeine-harmful",
    title: "Is Caffeine Harmful to Humans? Here's What You Need to Know",
    summary: "Balanced look at caffeine benefits, risks, safe intake ranges, and who should be cautious.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Caffeine", "Heart Health", "Sleep"],
    category: "Heart Health",
  },
  {
    slug: "how-to-live-a-healthy-life",
    title: "How to Live a Healthy Life: Daily Habits for Long-Term Wellness",
    summary: "Daily movement, nourishing food, solid sleep, and stress care—the habits that compound into lifelong health.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Wellness", "Lifestyle", "Heart Health"],
    category: "Wellness & Lifestyle",
  },
  {
    slug: "natural-antibiotic-foods",
    title: "Must-Have Natural Antibiotic Foods to Include in Your Diet",
    summary: "Foods with antimicrobial and immune-supporting properties—and how to use them safely alongside medical care.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Nutrition", "Immune Health", "Wellness"],
    category: "Nutrition",
  },
  {
    slug: "hydration-biology-liver-metabolism",
    title: "Hydration Biology & Liver Metabolism — Scientific Drinks That Support Hepatic Function in Summer",
    summary: "Hydration strategies and low-sugar electrolyte options to support liver function and metabolic balance in hot weather.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Liver Health", "Hydration", "Electrolytes"],
    category: "Nutrition",
  },
  {
    slug: "maternal-child-health-systems",
    title: "Maternal–Child Health Systems — Building Strong Foundations for Lifelong Wellness",
    summary: "Pillars of prenatal-to-postnatal care, skilled birth support, immunization, and community links that help mothers and babies thrive.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Maternal Health", "Child Health", "Prevention"],
    category: "Prevention & Awareness",
  },
  {
    slug: "hidden-brain-signals-tumour-clues",
    title: "Hidden Signals From the Brain: Early Neurological Clues That May Indicate a Tumour",
    summary: "Subtle neurological changes—headaches, vision shifts, speech or balance issues—that should prompt medical evaluation.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "5 min read",
    tags: ["Neurology", "Brain Tumour", "Awareness"],
    category: "Prevention & Awareness",
  },
  {
    slug: "yoga-surprising-benefits",
    title: "When the Body Speaks and Science Listens: 6 Surprising Benefits of Yoga",
    summary: "Science-backed benefits of yoga—from heart health and stress reduction to improved flexibility and mental clarity.",
    author: "Virat",
    date: "December 11, 2025",
    readTime: "6 min read",
    tags: ["Yoga", "Wellness", "Mental Health"],
    category: "Mental Health",
  },
];

const blogMap = {
  "how-to-reduce-heart-attack-risk": {
    Component: HeartAttackBlog,
    meta: blogPosts[0],
  },
  "how-to-reduce-body-fat-and-lose-weight": {
    Component: WeightLossBlog,
    meta: blogPosts[1],
  },
  "the-hidden-dangers-of-smoking": {
    Component: SmokingBlog,
    meta: blogPosts[2],
  },
  "understanding-high-sugar-levels": {
    Component: SugarBlog,
    meta: blogPosts[3],
  },
  "the-hidden-risks-of-over-exercising": {
    Component: OverExercisingBlog,
    meta: blogPosts[4],
  },
  "when-should-you-exercise": {
    Component: WhenExerciseBlog,
    meta: blogPosts[5],
  },
  "is-caffeine-harmful": {
    Component: CaffeineBlog,
    meta: blogPosts[6],
  },
  "how-to-live-a-healthy-life": {
    Component: HealthyLifeBlog,
    meta: blogPosts[7],
  },
  "natural-antibiotic-foods": {
    Component: NaturalAntibioticFoodsBlog,
    meta: blogPosts[8],
  },
  "hydration-biology-liver-metabolism": {
    Component: HydrationLiverBlog,
    meta: blogPosts[9],
  },
  "maternal-child-health-systems": {
    Component: MaternalChildHealthBlog,
    meta: blogPosts[10],
  },
  "hidden-brain-signals-tumour-clues": {
    Component: BrainSignalsTumourBlog,
    meta: blogPosts[11],
  },
  "yoga-surprising-benefits": {
    Component: YogaBenefitsBlog,
    meta: blogPosts[12],
  },
};

// Category icon mapping
const getCategoryIcon = (category) => {
  const iconMap = {
    "Heart Health": Heart,
    "Fitness & Exercise": Activity,
    "Nutrition": Apple,
    "Wellness & Lifestyle": Sparkles,
    "Mental Health": Brain,
    "Prevention & Awareness": Shield,
  };
  return iconMap[category] || BookOpen;
};

// Category color mapping
const getCategoryGradient = (category) => {
  const colorMap = {
    "Heart Health": "from-red-500/20 via-red-500/15 to-red-500/10",
    "Fitness & Exercise": "from-blue-500/20 via-cyan-500/20 to-blue-500/10",
    "Nutrition": "from-green-500/20 via-emerald-500/20 to-green-500/10",
    "Wellness & Lifestyle": "from-purple-500/20 via-pink-500/20 to-purple-500/10",
    "Mental Health": "from-indigo-500/20 via-blue-500/20 to-indigo-500/10",
    "Prevention & Awareness": "from-teal-500/20 via-cyan-500/20 to-teal-500/10",
  };
  return colorMap[category] || "from-accent/20 via-primary/20 to-accent/10";
};

// Atomic Component: Related Blog Card
const RelatedBlogCard = memo(({ post, onNavigate }) => {
  const { slug, title, summary, date, readTime, category } = post;
  const CategoryIcon = getCategoryIcon(category);

  return (
    <Link
      to={`/blogs/${slug}`}
      onClick={onNavigate}
      className="group block bg-card rounded-xl border border-border hover:border-accent/50 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryGradient(category)} flex items-center justify-center flex-shrink-0`}>
          <CategoryIcon className="w-6 h-6 text-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="text-xs mb-2">
            {category}
          </Badge>
          <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{readTime}</span>
            <span>•</span>
            <span>{date.split(" ")[0]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
});
RelatedBlogCard.displayName = "RelatedBlogCard";


// Atomic Component: Author Section
const AuthorSection = memo(({ author }) => (
  <div className="bg-gradient-to-br from-card to-accent/5 rounded-2xl p-6 md:p-8 border border-border shadow-lg">
    <div className="flex items-start gap-4 md:gap-6">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-accent via-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">{author}</h3>
          <Badge variant="outline" className="text-xs">Author</Badge>
        </div>
        <p className="text-sm md:text-base font-semibold text-accent mb-3">
          Health & Wellness Writer at 10000Hearts
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Dedicated to providing evidence-based health information and practical wellness guidance to help you live a healthier, happier life.
        </p>
      </div>
    </div>
  </div>
));
AuthorSection.displayName = "AuthorSection";

// Atomic Component: Article Details Card
const ArticleDetailsCard = memo(({ readTime, category, date }) => (
  <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Article Details</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Reading Time</span>
        <span className="font-medium">{readTime}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Category</span>
        <Badge variant="secondary">{category}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Published</span>
        <span className="font-medium">{date}</span>
      </div>
    </div>
  </div>
));
ArticleDetailsCard.displayName = "ArticleDetailsCard";

// Atomic Component: CTA Card
const CTACard = memo(({ onNavigate }) => (
  <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-6 border border-accent/20">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
        <Heart className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-lg font-semibold">Take Control of Your Health</h3>
      <p className="text-sm text-muted-foreground">
        Get personalized health guidance from our AI companion
      </p>
      <Button
        onClick={onNavigate}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        Talk to AI Companion
      </Button>
    </div>
  </div>
));
CTACard.displayName = "CTACard";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const entry = slug ? blogMap[slug] : null;

  // Memoized category icon
  const categoryIcon = useMemo(() => {
    if (!entry) return BookOpen;
    return getCategoryIcon(entry.meta.category);
  }, [entry]);

  // Memoized related blogs
  const relatedBlogs = useMemo(() => {
    if (!entry) return [];
    const { category, slug: currentSlug } = entry.meta;
    return blogPosts
      .filter((post) => post.category === category && post.slug !== currentSlug)
      .slice(0, 4);
  }, [entry]);


  // Memoized navigation handlers
  const handleNavigateToBlogs = useCallback(() => {
    navigate("/blogs");
  }, [navigate]);

  const handleNavigateToWellness = useCallback(() => {
    navigate("/wellness-campaign");
  }, [navigate]);

  const handleRelatedBlogClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!entry) {
    return <Navigate to="/blogs" replace />;
  }

  const { Component, meta } = entry;
  const CategoryIcon = categoryIcon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Image Section */}
      <section className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(meta.category)}`}>
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Overlay Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={meta.title}
            className="w-full h-full object-cover opacity-10"
          />
        </div>

        {/* Back to Blogs Button - Top */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-2 md:pt-3">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToBlogs}
              className="text-white hover:text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <Badge className="bg-white/90 dark:bg-card/90 text-foreground backdrop-blur-sm">
                  {meta.category}
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
                {meta.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4" />
                  <span>{meta.author}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>{meta.date}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>{meta.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Article Left, Related Blogs Right */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Article Content - Left Side */}
          <article className="lg:col-span-8 space-y-8">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-6 pb-2">
              <span className="text-sm font-semibold text-muted-foreground mr-2">Topics:</span>
              {meta.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs md:text-sm px-3 py-1 font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Divider */}
            <div className="border-t border-border my-6"></div>

            {/* Article Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:scroll-m-20 
              prose-headings:font-bold 
              prose-headings:text-foreground
              prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:font-extrabold prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight prose-h1:text-accent
              prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h2:leading-tight prose-h2:text-foreground
              prose-h3:text-2xl prose-h3:md:text-3xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6 prose-h3:leading-snug prose-h3:text-foreground
              prose-h4:text-xl prose-h4:md:text-2xl prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-4
              prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
              prose-strong:text-foreground prose-strong:font-bold
              prose-ul:list-disc prose-ul:my-6 prose-ul:space-y-3 prose-ul:pl-6
              prose-ol:list-decimal prose-ol:my-6 prose-ol:space-y-3 prose-ol:pl-6
              prose-li:my-2
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:w-full prose-img:border prose-img:border-border
              prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:bg-accent/5 prose-blockquote:rounded-r-lg prose-blockquote:text-foreground prose-blockquote:font-medium
              prose-code:text-sm prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-foreground
              prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
              prose-hr:my-8 prose-hr:border-border
              prose-table:w-full prose-table:my-6
              prose-th:font-semibold prose-th:bg-muted prose-th:p-3
              prose-td:p-3 prose-td:border-t prose-td:border-border">
              <Component />
            </div>

            <AuthorSection author={meta.author} />
          </article>

          {/* Sidebar - Right Side */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Article Details */}
            <ArticleDetailsCard readTime={meta.readTime} category={meta.category} date={meta.date} />

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold">Related Articles</h3>
                </div>
                <div className="space-y-4">
                  {relatedBlogs.map((post) => (
                    <RelatedBlogCard
                      key={post.slug}
                      post={post}
                      onNavigate={handleRelatedBlogClick}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToBlogs}
                  className="w-full mt-4 border-accent text-accent hover:bg-accent/10"
                >
                  View All Blogs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* CTA Card */}
            <CTACard onNavigate={handleNavigateToWellness} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogDetail;
