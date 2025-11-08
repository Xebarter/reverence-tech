import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  children?: React.ReactNode;
}

export default function SEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl,
  children
}: SEOProps) {
  const siteTitle = title 
    ? `${title} | Reverence Technology` 
    : 'Reverence Technology - Empowering East Africa Through Digital Innovation';
    
  const siteDescription = description || 'Leading technology solutions provider in Uganda offering web development, e-commerce, cloud migration, cybersecurity, and digital transformation services.';
  
  const siteKeywords = keywords || 'technology, digital innovation, Uganda, East Africa, web development, e-commerce, cloud migration, cybersecurity';
  
  const siteOgTitle = ogTitle || siteTitle;
  const siteOgDescription = ogDescription || siteDescription;
  const siteOgImage = ogImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80';
  const siteOgUrl = ogUrl || window.location.href;
  
  const siteTwitterTitle = twitterTitle || siteOgTitle;
  const siteTwitterDescription = twitterDescription || siteOgDescription;
  const siteTwitterImage = twitterImage || siteOgImage;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteOgTitle} />
      <meta property="og:description" content={siteOgDescription} />
      <meta property="og:image" content={siteOgImage} />
      <meta property="og:url" content={siteOgUrl} />
      <meta property="og:type" content={ogType} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={siteTwitterTitle} />
      <meta name="twitter:description" content={siteTwitterDescription} />
      <meta name="twitter:image" content={siteTwitterImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {children}
    </Helmet>
  );
}