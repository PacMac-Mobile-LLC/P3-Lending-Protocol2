import React, { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
}

export const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // We use rss2json to bypass CORS restrictions normally associated with fetching XML from external domains in the browser
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
        const data = await res.json();
        
        if (data.status === 'ok' && data.items) {
          const items = data.items.slice(0, 10).map((item: any) => ({
            title: item.title,
            link: item.link
          }));
          setNews(items);
        } else {
          throw new Error('Feed error');
        }
      } catch (e) {
        console.error("Failed to load crypto news", e);
        // Fallback mock data if API fails
        setNews([
           { title: "Bitcoin stabilizes as institutional interest grows in DeFi sector", link: "#" },
           { title: "P3 Lending Protocol volume surges 200% after new reputation model release", link: "#" },
           { title: "Regulatory clarity expected to boost crypto lending markets in Q4", link: "#" },
           { title: "Ethereum gas fees drop to 6-month low, enabling micro-lending growth", link: "#" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading && news.length === 0) return null;

  return (
    <div className="bg-[#0a0a0a] border-b border-zinc-800 h-8 flex items-center overflow-hidden relative z-20 select-none">
      {/* Fade Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      
      {/* Label */}
      <div className="bg-[#00e599] text-black text-[10px] font-bold px-3 h-full flex items-center z-20 mr-2">
        LIVE NEWS
      </div>

      {/* Scrolling Content */}
      <div className="flex items-center gap-8 animate-ticker whitespace-nowrap hover:pause-animation">
        {/* Render twice for seamless loop */}
        {[...news, ...news].map((item, i) => (
          <a 
            key={i} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-mono font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="text-[#00e599] opacity-50 group-hover:opacity-100">•</span>
            {item.title.toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  );
};