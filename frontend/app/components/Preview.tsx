import React, { useState, useEffect } from 'react';

export function Preview() {
    const [resumeHtml, setResumeHtml] = useState('<p>Your resume will appear here...</p>');

    // Example: Simulate updating the resume HTML content
    useEffect(() => {
        const timer = setTimeout(() => {
            setResumeHtml('<h1>John Doe</h1><p>Software Engineer</p><h2>Experience</h2><p>Software Engineer at Google</p><h2>Education</h2><p>Bachelor of Science in Computer Science</p>');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div dangerouslySetInnerHTML={{ __html: resumeHtml }} />
    );
}