import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import Navbar from '../navbar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TrueFocus from "../trueFocus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faFacebook, faInstagram, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SUPABASE_URL, supabaseHeaders } from '../config/config';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs`, {
          headers: supabaseHeaders
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        // Sort blogs by creation date (newest first)
        const sortedBlogs = data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Select a random blog for featuring
        const randomIndex = Math.floor(Math.random() * sortedBlogs.length);
        setFeaturedBlog(sortedBlogs[randomIndex]);
        
        // Remove featured blog from the list
        const otherBlogs = sortedBlogs.filter((_, index) => index !== randomIndex);
        setBlogs(otherBlogs);
      } catch (error) {
        setError('Failed to load blogs');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (featuredBlog?.image_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = featuredBlog.image_url;
    }
  }, [featuredBlog?.image_url]);

  if (loading) return <Loading>Loading blogs...</Loading>;
  if (error) return <Error>{error}</Error>;

  return (
    <>
      <Navbar />
      <BlogContainer>
        {/* Featured Blog Section */}
        {featuredBlog && (
          <FeaturedSection>
            <div className="flex flex-col justify-center items-center h-fit bg-white " id="Blog2">
              <p className="desc font-bold text-3xl">
                <p className="desc text-center text-md">
                  <TrueFocus
                    sentence={featuredBlog.title}
                    manualMode={false}
                    blurAmount={2}
                    borderColor="rgb(67, 67, 253)"
                    animationDuration={1}
                    pauseBetweenAnimations={1}
                  />
                </p>
                <div className="flex flex-row">
                  <motion.div
                    initial={{ width: "10%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="horizontal-line"
                  ></motion.div>
                  <div className="circle"></div>
                </div>
                <p className="text-xs">Featured Blog.</p>
              </p>
              <br />
              <div className="flex flex-col max-w-4xl">
                <p className="desc text-4xl text-start font-bold">{featuredBlog.title}</p>
                <p className="desc">
                  {format(new Date(featuredBlog.created_at), 'dd MMM yyyy')}
                  <span className="text-blue-500"> BY: {renderAuthor(featuredBlog) || 'REMAYA.org'}</span>
                </p>
                <div className="flex flex-row gap-2">
                  <FontAwesomeIcon icon={faXTwitter} className="text-2xl text-black hover:cursor-pointer" />
                  <FontAwesomeIcon icon={faFacebook} className="text-black text-2xl hover:cursor-pointer" />
                  <FontAwesomeIcon icon={faInstagram} className="text-2xl text-black hover:cursor-pointer" />
                </div>
                <br />
                {featuredBlog.image_url && (
                  !imageLoaded ? (
                    <Skeleton width="100%" height={400} />
                  ) : (
                    <img 
                      src={featuredBlog.image_url} 
                      alt={featuredBlog.title}
                      className="w-full h-[400px] object-cover rounded-lg"
                      onLoad={() => setImageLoaded(true)}
                    />
                  )
                )}
                <br />
                <div 
                  className="text-start desc blog-content"
                  dangerouslySetInnerHTML={{ __html: featuredBlog.content.substring(0, 500) + '...' }}
                />
                <button 
                  className="text-start desc rb-btn mt-4"
                  onClick={() => navigate(`/blog/${featuredBlog.id}`)}
                >
                  Read More
                </button>
              </div>
            </div>
          </FeaturedSection>
        )}

        {/* Other Blogs Section */}
        <OtherBlogsSection>
          <h2 className="desc font-bold text-2xl mb-6">More Stories</h2>
          <BlogGrid>
            {blogs.map((blog) => (
              <BlogCard key={blog.id}>
                <BlogImage>
                  {!imageLoaded && <Skeleton height={200} />}
                  <img 
                    src={blog.image_url || 'https://via.placeholder.com/400x200'} 
                    alt={blog.title}
                    onLoad={() => setImageLoaded(true)}
                    style={{ 
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: imageLoaded ? 'block' : 'none'
                    }}
                  />
                </BlogImage>
                <BlogContent>
                  <BlogTitle>{blog.title}</BlogTitle>
                  <AuthorSection>
                    <AuthorInfo>
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user_email}`}
                        alt="Author"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium text-gray-700">
                        {blog.user_email ? blog.user_email.split('@')[0] : 'Anonymous'}
                      </span>
                    </AuthorInfo>
                    <SocialLinks>
                      <a 
                        href={`https://twitter.com/${blog.twitter_handle || 'anonymous'}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faTwitter} />
                      </a>
                      <a 
                        href={`https://linkedin.com/in/${blog.linkedin_handle || 'anonymous'}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faLinkedin} />
                      </a>
                    </SocialLinks>
                  </AuthorSection>
                  <BlogDate>
                    {format(new Date(blog.created_at), 'MMMM dd, yyyy')}
                  </BlogDate>
                  <BlogExcerpt>
                    {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </BlogExcerpt>
                  <button
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Read More
                  </button>
                </BlogContent>
              </BlogCard>
            ))}
          </BlogGrid>
          {blogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No blogs found.</p>
            </div>
          )}
        </OtherBlogsSection>
      </BlogContainer>
    </>
  );
};

const BlogContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    color: #1a365d;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #4a5568;
    font-size: 1.2rem;
  }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
`;

const BlogCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15);
  }
`;

const BlogImage = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background-color: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const BlogContent = styled.div`
  padding: 1.5rem;
`;

const BlogTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BlogDate = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const BlogExcerpt = styled.p`
  color: #4a5568;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-left: auto;

  a {
    color: #64748b;
    transition: color 0.2s;

    &:hover {
      color: #3b82f6;
    }
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #4a5568;
`;

const Error = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e53e3e;
`;

const FeaturedSection = styled.section`
  margin-bottom: 4rem;
  padding: 2rem;
  background: white;
`;

const OtherBlogsSection = styled.section`
  padding: 2rem;
  background: #f8fafc;
`;

const renderAuthor = (blog) => {
  if (!blog.profiles) return 'Unknown Author';
  return blog.profiles.email;
};

export default BlogPage; 