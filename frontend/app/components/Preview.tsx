import React, { useState, useEffect } from 'react';

export function Preview() {
    const [resumeHtml, setResumeHtml] = useState('<p>Your resume will appear here...</p>');

    // Update the resume HTML content with a formatted template
    useEffect(() => {
        const timer = setTimeout(() => {
            setResumeHtml(`
                <div class="resume-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px;">
                        <h1 style="font-size: 40px; margin: 0; letter-spacing: 5px; text-transform: uppercase;">JOHN SMITH</h1>
                        <h2 style="font-size: 18px; font-weight: normal; margin: 10px 0; text-transform: uppercase; letter-spacing: 3px;">HIGH SCHOOL STUDENT</h2>
                    </div>
                    
                    <div style="display: flex; gap: 30px;">
                        <div style="flex: 1;">
                            <div style="margin-bottom: 30px;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">CONTACT</h3>
                                <p style="margin: 5px 0;"><strong>📱</strong> 1-012-3456-789</p>
                                <p style="margin: 5px 0;"><strong>✉️</strong> johnsmith@mail.com</p>
                                <p style="margin: 5px 0;"><strong>🏠</strong> 123 Main Street, New York, NY 10001</p>
                            </div>
                            
                            <div class="highlight-section" style="margin-bottom: 30px !important; background-color: #f0f7ff !important; padding: 15px !important; border-radius: 10px !important;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">ACHIEVEMENTS</h3>
                                <p style="margin: 5px 0;">• Honor Roll Student / 2022-2023</p>
                                <p style="margin: 5px 0;">• Science Fair Winner / 2023</p>
                            </div>
                            
                            <div class="highlight-section" style="margin-bottom: 30px !important; background-color: #f0f7ff !important; padding: 15px !important; border-radius: 10px !important;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">TECHNICAL SKILLS</h3>
                                <p style="margin: 5px 0;">• Computer Programming</p>
                                <p style="margin: 5px 0;">• Mathematics</p>
                                <p style="margin: 5px 0;">• Microsoft Office</p>
                            </div>
                            
                            <div class="highlight-section" style="margin-bottom: 30px !important; background-color: #f0f7ff !important; padding: 15px !important; border-radius: 10px !important;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">ACTIVITIES</h3>
                                <h4 style="margin: 5px 0; font-size: 16px;">HIGH SCHOOL TENNIS TEAM</h4>
                                <p style="margin: 5px 0;">2021 - Present</p>
                            </div>
                            
                            <div class="highlight-section" style="margin-bottom: 30px !important; background-color: #f0f7ff !important; padding: 15px !important; border-radius: 10px !important;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">KEY SKILLS</h3>
                                <p style="margin: 5px 0;">• Friendly</p>
                                <p style="margin: 5px 0;">• Good listener</p>
                                <p style="margin: 5px 0;">• Courteous</p>
                                <p style="margin: 5px 0;">• Helpful</p>
                                <p style="margin: 5px 0;">• Interpersonal</p>
                                <p style="margin: 5px 0;">• Positive attitude</p>
                            </div>
                        </div>
                        
                        <div style="flex: 1.2;">
                            <div style="margin-bottom: 30px;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">SUMMARY</h3>
                                <p style="margin: 5px 0; line-height: 1.5;">
                                    Motivated high school student with a strong work ethic and excellent academic record. 
                                    Passionate about learning new skills and contributing to my community through volunteer work.
                                    Seeking opportunities to gain experience and develop professionally.
                                </p>
                            </div>
                            
                            <div style="margin-bottom: 30px; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">EDUCATION</h3>
                                <h4 style="margin: 5px 0; font-size: 16px;">WASHINGTON HIGH SCHOOL, NEW YORK, NY</h4>
                                <p style="margin: 5px 0;">2022 - Present | GPA: 3.75</p>
                            </div>
                            
                            <div style="margin-bottom: 30px;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">EXPERIENCE</h3>
                                
                                <h4 style="margin: 10px 0 5px 0; font-size: 16px;">PET SITTER</h4>
                                <p style="margin: 0 0 5px 0;">2021 - Present</p>
                                <p style="margin: 5px 0;">• Provide care for pets while owners are away</p>
                                <p style="margin: 5px 0;">• Responsible for feeding, walking, and playing with animals</p>
                                
                                <h4 style="margin: 20px 0 5px 0; font-size: 16px;">CHILD CARE ASSISTANT</h4>
                                <p style="margin: 0 0 5px 0;">2021 - Present</p>
                                <p style="margin: 5px 0;">• Assist with after-school care for elementary students</p>
                                <p style="margin: 5px 0;">• Help with homework and organize recreational activities</p>
                            </div>
                            
                            <div style="margin-bottom: 30px;">
                                <h3 style="font-size: 18px; margin: 0 0 15px 0; text-transform: uppercase;">VOLUNTEER WORK</h3>
                                
                                <h4 style="margin: 10px 0 5px 0; font-size: 16px;">YOUTH BASKETBALL COACH</h4>
                                <p style="margin: 0 0 5px 0;">2021 - Present</p>
                                
                                <h4 style="margin: 20px 0 5px 0; font-size: 16px;">COMMUNITY FOOD BANK</h4>
                                <p style="margin: 0 0 5px 0;">2022 - Present</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="resume-preview">
            <style jsx global>{`
                .highlight-section {
                    margin-bottom: 30px !important;
                    background-color: #f0f7ff !important;
                    padding: 15px !important;
                    border-radius: 10px !important;
                }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: resumeHtml }} />
        </div>
    );
}