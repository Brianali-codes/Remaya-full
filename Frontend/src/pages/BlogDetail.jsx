import Nav2 from "../nav2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState, useEffect } from "react";
import TrueFocus from "../trueFocus";
import { motion } from "framer-motion";
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Contacts from "../contacts";
import { SUPABASE_URL, supabaseHeaders } from '../config/config';

function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/blogs?id=eq.${id}`, {
                    headers: supabaseHeaders
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                setBlog(data[0]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    useEffect(() => {
        if (blog?.image_url) {
            const img = new Image();
            img.onload = () => setImageLoaded(true);
            img.src = blog.image_url;
        }
    }, [blog?.image_url]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!blog) {
        return <div>Blog not found</div>;
    }

    return (
        <>
            <Nav2/>
            <div className="flex flex-col justify-center items-center h-fit bg-white p-5" id="Blog">
                <p className="desc font-bold text-3xl">
                    <p className="desc text-center text-md">
                        <TrueFocus
                            sentence={blog.title}
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
                    <p className="text-xs">Remaya's Blog</p>
                </p>
                <br />
                <div className="flex flex-col">
                    <p className="desc text-4xl text-start font-bold">{blog.title}</p>
                    <p className="desc">
                        {format(new Date(blog.created_at), 'dd MMM yyyy')} 
                        <span className="text-blue-500"> BY: {blog.author_name || 'REMAYA.org'}</span>
                    </p>
                    <div className="flex flex-row gap-2">
                        <FontAwesomeIcon icon={faXTwitter} className="text-2xl text-black hover:cursor-pointer" />
                        <a href="https://m.facebook.com/people/Remaya-ORG/100064591067526/" target="_blank">
                            <FontAwesomeIcon icon={faFacebook} className="text-black text-2xl hover:cursor-pointer" />
                        </a>
                        <FontAwesomeIcon icon={faInstagram} className="text-2xl text-black hover:cursor-pointer" />
                    </div>
                    <br />
                    {blog.image_url && (
                        !imageLoaded ? (
                            <Skeleton width="100%" height={300} style={{ borderRadius: '8px', marginTop: '10px' }} />
                        ) : (
                            <img 
                                src={blog.image_url} 
                                alt={blog.title} 
                                style={{ borderRadius: '8px', marginTop: '10px' }} 
                            />
                        )
                    )}
                    <br />
                    <div 
                        className="text-start desc blog-content"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
            </div>
            <Contacts/>
        </>
    );
}

export default BlogDetail; 