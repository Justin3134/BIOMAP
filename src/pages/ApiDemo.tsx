import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { projectAPI, researchAPI, chatAPI, notesAPI } from '@/lib/api';
import { useBackendHealth } from '@/hooks/useBackend';

/**
 * Demo page to test backend integration
 * This shows how all the API features work
 */
export default function ApiDemo() {
  const { isHealthy, error: healthError } = useBackendHealth();
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<string>('Ready');
  const [result, setResult] = useState<any>(null);

  const showResult = (data: any) => {
    setResult(data);
  };

  // Test 1: Create Project
  const testCreateProject = async () => {
    setStatus('Creating project...');
    try {
      const project = await projectAPI.create({
        description: 'Developing biodegradable plastics using bacterial enzymes',
        capabilities: { lab: 'basic', equipment: ['PCR', 'incubator'] },
        constraints: { budget: 5000, timeline: '6 months' }
      });
      setProjectId(project.id);
      showResult(project);
      setStatus(`✅ Project created! ID: ${project.id}`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  // Test 2: Build Research Map (THE CORE)
  const testBuildResearchMap = async () => {
    if (!projectId) {
      setStatus('❌ Create a project first');
      return;
    }
    
    setStatus('🔍 Building research map... (this takes ~30 seconds)');
    try {
      const map = await researchAPI.buildMap(projectId);
      showResult(map);
      setStatus(`✅ Found ${map.totalPapers} papers in ${map.clusters.length} clusters!`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  // Test 3: Extract Evidence
  const testExtractEvidence = async () => {
    setStatus('📋 Extracting evidence...');
    try {
      const evidence = await researchAPI.extractEvidence(
        'test-123',
        'Biodegradable Plastics from Bacterial Enzymes',
        'This study demonstrates the use of bacterial enzymes to degrade plastic polymers. We achieved 80% degradation in 30 days using Pseudomonas species. However, the process required specific pH conditions and temperature control.'
      );
      showResult(evidence);
      setStatus('✅ Evidence extracted!');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  // Test 4: Context-Aware Chat
  const testChat = async () => {
    if (!projectId) {
      setStatus('❌ Create a project first');
      return;
    }

    setStatus('💬 Sending chat message...');
    try {
      const response = await chatAPI.send(
        projectId,
        'What are the biggest risks with this approach?'
      );
      showResult(response);
      setStatus(`✅ Chat response (using ${response.contextUsed.papers} papers, ${response.contextUsed.notes} notes)`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  // Test 5: Create and Refine Note
  const testNotes = async () => {
    if (!projectId) {
      setStatus('❌ Create a project first');
      return;
    }

    setStatus('📝 Creating note...');
    try {
      const note = await notesAPI.create(
        projectId,
        'Need to test enzyme stability at different pH levels. Previous research suggests pH 7-8 works best.',
        [{ type: 'paper', id: 'test-123', title: 'Test Paper' }]
      );
      
      setStatus('🔄 Refining note...');
      const refined = await notesAPI.refine(note.id, 'next_steps');
      
      showResult({ original: note, refined });
      setStatus('✅ Note created and refined!');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Backend API Demo</h1>
        <p className="text-muted-foreground">Test the intelligent backend integration</p>
      </div>

      {/* Health Check */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Backend Health</h2>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>
            {isHealthy === null ? 'Checking...' : isHealthy ? '✅ Backend is running' : '❌ Backend not responding'}
          </span>
        </div>
        {healthError && (
          <p className="text-sm text-red-500 mt-2">Error: {healthError}</p>
        )}
      </Card>

      {/* Test Actions */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={testCreateProject} className="h-24 flex-col">
            <span className="text-2xl mb-2">1️⃣</span>
            <span>Create Project</span>
          </Button>
          
          <Button onClick={testBuildResearchMap} className="h-24 flex-col" disabled={!projectId}>
            <span className="text-2xl mb-2">2️⃣</span>
            <span>Build Research Map</span>
            <span className="text-xs">(~30 sec)</span>
          </Button>
          
          <Button onClick={testExtractEvidence} className="h-24 flex-col">
            <span className="text-2xl mb-2">3️⃣</span>
            <span>Extract Evidence</span>
          </Button>
          
          <Button onClick={testChat} className="h-24 flex-col" disabled={!projectId}>
            <span className="text-2xl mb-2">4️⃣</span>
            <span>Context-Aware Chat</span>
          </Button>
        </div>

        <Button onClick={testNotes} className="w-full h-24 flex-col" disabled={!projectId}>
          <span className="text-2xl mb-2">5️⃣</span>
          <span>Create & Refine Note</span>
        </Button>
      </Card>

      {/* Status */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <p className="font-mono text-sm">{status}</p>
        {projectId && (
          <p className="text-sm text-muted-foreground mt-2">
            Current Project ID: {projectId}
          </p>
        )}
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <Textarea
            value={JSON.stringify(result, null, 2)}
            readOnly
            className="font-mono text-xs h-96"
          />
        </Card>
      )}
    </div>
  );
}

