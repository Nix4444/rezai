import React, { useState, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button, TextArea, Card, Flex, Text, Box, Heading, Badge } from '@radix-ui/themes';
import { PaperPlaneIcon, CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon, LightningBoltIcon, FileTextIcon } from '@radix-ui/react-icons';

interface AtsScoreResult {
  match_score: string;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
  keyword_gaps: string[];
  formatted_resume: string;
  alternative_phrasing: {
    original: string[];
    suggested: string[];
  };
}

export default function AtsScore() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [coachResult, setCoachResult] = useState<string | null>(null);
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ats' | 'coach' | 'coverLetter'>('ats');
  const { data: session } = useSession();

  const getAuthToken = async () => {
    const tokenResponse = await fetch('/api/auth/token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      throw new Error('Failed to get authentication token');
    }
    
    return token;
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!session?.user?.id) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTab('ats');
    
    try {
      const token = await getAuthToken();
      
      // Send job description to the API
      const response = await axios.post(
        'http://localhost:3001/api/ats-score', 
        { jobDescription },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true
        }
      );
      
      if (response.data) {
        // Parse the response if it's a string (might be JSON formatted as string)
        let parsedResult;
        
        try {

          if (response.data.kwargs && response.data.kwargs.content) {

            const contentStr = response.data.kwargs.content;
            parsedResult = typeof contentStr === 'string' 
              ? JSON.parse(contentStr)
              : contentStr;
          } else if (typeof response.data === 'string') {

            parsedResult = JSON.parse(response.data);
          } else {

            parsedResult = response.data;
          }
          

          const sanitizedResult = {
            match_score: parsedResult.match_score || '0%',
            strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [],
            weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [],
            missing_skills: Array.isArray(parsedResult.missing_skills) ? parsedResult.missing_skills : [],
            suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : [],
            keyword_gaps: Array.isArray(parsedResult.keyword_gaps) ? parsedResult.keyword_gaps : [],
            formatted_resume: parsedResult.formatted_resume || '',
            alternative_phrasing: {
              original: Array.isArray(parsedResult.alternative_phrasing?.original) 
                ? parsedResult.alternative_phrasing.original 
                : [],
              suggested: Array.isArray(parsedResult.alternative_phrasing?.suggested)
                ? parsedResult.alternative_phrasing.suggested
                : []
            }
          };
          
          setResult(sanitizedResult);
        } catch (parseError) {
          console.error('Error parsing response:', parseError, 'Response data:', response.data);
          setError('Failed to parse the response from the server');
        }
      } else {
        setError('No data received from the server');
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('An error occurred while analyzing your resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoachGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!session?.user?.id) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTab('coach');
    
    try {
      const token = await getAuthToken();
      

      const response = await axios.post(
        'http://localhost:3001/api/ai-coach', 
        { jobDescription },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true
        }
      );
      
      if (response.data) {
        let content = '';
        

        if (response.data.kwargs && response.data.kwargs.content) {
          content = response.data.kwargs.content;
        } else if (typeof response.data === 'string') {
          content = response.data;
        } else if (response.data.text) {
          content = response.data.text;
        } else {
          content = JSON.stringify(response.data);
        }
        
        setCoachResult(content);
      } else {
        setError('No data received from the server');
      }
    } catch (err) {
      console.error('Error generating coaching plan:', err);
      setError('An error occurred while generating your coaching plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetterGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!session?.user?.id) {
      setError('You must be logged in to use this feature');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTab('coverLetter');
    
    try {
      const token = await getAuthToken();
      
      const response = await axios.post(
        'http://localhost:3001/api/cover-letter', 
        { jobDescription },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true
        }
      );
      
      if (response.data) {
        let content = '';
        

        if (response.data.kwargs && response.data.kwargs.content) {
          content = response.data.kwargs.content;
        } else if (typeof response.data === 'string') {
          content = response.data;
        } else if (response.data.text) {
          content = response.data.text;
        } else {
          content = JSON.stringify(response.data);
        }
        
        setCoverLetterResult(content);
      } else {
        setError('No data received from the server');
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError('An error occurred while generating your cover letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (activeTab === 'ats' && result) {
      return (
        <Card className="mb-8">
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2">
              <Heading size="5">Resume Match Score</Heading>
              <Badge size="2" color={
                parseInt(result.match_score) >= 70 ? 'green' : 
                parseInt(result.match_score) >= 50 ? 'orange' : 'red'
              }>
                {result.match_score}
              </Badge>
            </Flex>
            
            <Flex direction="column" gap="3">
              {result.strengths && result.strengths.length > 0 && (
                <Box>
                  <Heading size="3" style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircledIcon /> Strengths
                  </Heading>
                  <ul>
                    {result.strengths.map((strength, index) => (
                      <li key={`strength-${index}`}>{strength}</li>
                    ))}
                  </ul>
                </Box>
              )}
              
              {result.weaknesses && result.weaknesses.length > 0 && (
                <Box>
                  <Heading size="3" style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CrossCircledIcon /> Weaknesses
                  </Heading>
                  <ul>
                    {result.weaknesses.map((weakness, index) => (
                      <li key={`weakness-${index}`}>{weakness}</li>
                    ))}
                  </ul>
                </Box>
              )}
              
              {result.missing_skills && result.missing_skills.length > 0 && (
                <Box>
                  <Heading size="3" style={{ color: 'orange', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExclamationTriangleIcon /> Missing Skills
                  </Heading>
                  <ul>
                    {result.missing_skills.map((skill, index) => (
                      <li key={`skill-${index}`}>{skill}</li>
                    ))}
                  </ul>
                </Box>
              )}
              
              {result.suggestions && result.suggestions.length > 0 && (
                <Box>
                  <Heading size="3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <InfoCircledIcon /> Suggestions for Improvement
                  </Heading>
                  <ul>
                    {result.suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </Box>
              )}
              
              {result.keyword_gaps && result.keyword_gaps.length > 0 && (
                <Box>
                  <Heading size="3">Keyword Gaps</Heading>
                  <Flex wrap="wrap" gap="2">
                    {result.keyword_gaps.map((keyword, index) => (
                      <Badge key={`keyword-${index}`} color="blue">{keyword}</Badge>
                    ))}
                  </Flex>
                </Box>
              )}
              
              {result.alternative_phrasing && 
               result.alternative_phrasing.original && 
               result.alternative_phrasing.suggested && 
               result.alternative_phrasing.original.length > 0 && 
               result.alternative_phrasing.suggested.length > 0 && (
                <Box>
                  <Heading size="3">Alternative Phrasing</Heading>
                  {result.alternative_phrasing.original.map((original, index) => (
                    index < result.alternative_phrasing.suggested.length && (
                      <Flex key={`phrasing-${index}`} direction="column" gap="1" style={{ marginBottom: '10px' }}>
                        <Text weight="bold">Original:</Text>
                        <Text style={{ padding: '8px', background: '#303030', borderRadius: '4px' }}>{original}</Text>
                        <Text weight="bold">Suggested:</Text>
                        <Text style={{ padding: '8px', background: '#303030', borderRadius: '4px', borderLeft: '3px solid #4f46e5' }}>
                          {result.alternative_phrasing.suggested[index]}
                        </Text>
                      </Flex>
                    )
                  ))}
                </Box>
              )}
            </Flex>
          </Flex>
        </Card>
      );
    } else if (activeTab === 'coach' && coachResult) {
      return (
        <Card className="mb-8">
          <Flex direction="column" gap="4">
            <Heading size="5">AI Career Coach Plan</Heading>
            <Box style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {coachResult}
            </Box>
          </Flex>
        </Card>
      );
    } else if (activeTab === 'coverLetter' && coverLetterResult) {
      return (
        <Card className="mb-8">
          <Flex direction="column" gap="4">
            <Heading size="5">Cover Letter</Heading>
            <Box style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {coverLetterResult}
            </Box>
          </Flex>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <Flex direction="column" gap="4">
      {/* Results section - show only when there are results */}
      {renderResults()}
      
      {/* Input section - moved to the bottom with enhanced styling */}
      <Card className="bg-[#202020]">
        <Flex direction="column" gap="3">
          <Box className="mb-2">
            <Heading size="4" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600" style={{ marginBottom: '8px' }}>
              Job Description
            </Heading>
            <Text className="text-gray-400">
              Paste a job description below to use with any of our AI tools
            </Text>
          </Box>
          
          <TextArea 
            placeholder="Paste the job description here..." 
            value={jobDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
            className="job-description-input"
          />
          
          <Flex  justify="between" mt="2" gap="3" wrap="wrap">
            <Flex gap="2">
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !session?.user?.id}
                className="analyze-button"
                size="3"
              >
                {loading && activeTab === 'ats' ? 'Analyzing...' : 'ATS Score'}
                {!loading && <PaperPlaneIcon style={{ marginLeft: '8px' }} />}
              </Button>
              
              <Button 
                onClick={handleCoachGenerate} 
                disabled={loading || !session?.user?.id}
                className="coach-button"
                size="3"
                variant="soft"
              >
                {loading && activeTab === 'coach' ? 'Generating...' : 'AI Coach'}
                {!loading && <LightningBoltIcon style={{ marginLeft: '8px' }} />}
              </Button>
              
              <Button 
                onClick={handleCoverLetterGenerate} 
                disabled={loading || !session?.user?.id}
                className="cover-letter-button"
                size="3"
                variant="soft"
              >
                {loading && activeTab === 'coverLetter' ? 'Generating...' : 'Cover Letter'}
                {!loading && <FileTextIcon style={{ marginLeft: '8px' }} />}
              </Button>
            </Flex>
          </Flex>
          
          {error && (
            <Text color="red" style={{ marginTop: '10px' }}>
              <ExclamationTriangleIcon /> {error}
            </Text>
          )}
          
          {!session?.user?.id && (
            <Text color="orange" style={{ marginTop: '10px' }}>
              <InfoCircledIcon /> You need to be logged in to use this feature.
            </Text>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
