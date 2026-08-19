import React, { useState } from 'react';
import { Cloud, Server, Database, Shield, Activity, DollarSign, Play, Square, Plus, Globe, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

interface EC2Instance {
  id: string;
  name: string;
  type: string;
  state: 'running' | 'stopped';
  publicIp: string;
  privateIp: string;
  az: string;
}

const INITIAL_INSTANCES: EC2Instance[] = [
  { id: 'i-0a812f9b1c', name: 'santoge-api-prod-01', type: 't3.large', state: 'running', publicIp: '13.234.18.91', privateIp: '10.0.1.24', az: 'ap-south-1a' },
  { id: 'i-09f482d88a', name: 'santoge-worker-celery', type: 't3.medium', state: 'running', publicIp: '13.234.22.104', privateIp: '10.0.2.18', az: 'ap-south-1b' },
  { id: 'i-037cb8114e', name: 'santoge-ml-inference', type: 'g4dn.xlarge', state: 'stopped', publicIp: '-', privateIp: '10.0.3.50', az: 'ap-south-1a' },
];

export const AWSSimulator: React.FC = () => {
  const [activeService, setActiveService] = useState<'ec2' | 's3' | 'iam' | 'cloudwatch' | 'billing'>('ec2');
  const [instances, setInstances] = useState<EC2Instance[]>(INITIAL_INSTANCES);
  const [region, setRegion] = useState('ap-south-1 (Mumbai)');
  const [s3Buckets, setS3Buckets] = useState([
    { name: 'santoge-resumes-prod', region: 'ap-south-1', access: 'Bucket and objects not public', objectsCount: 4250, sizeGB: 18.4 },
    { name: 'santoge-static-assets-cdn', region: 'ap-south-1', access: 'Public Read via CloudFront', objectsCount: 890, sizeGB: 4.2 },
    { name: 'santoge-db-backups-archive', region: 'ap-south-1', access: 'Glacier Deep Archive', objectsCount: 120, sizeGB: 85.0 },
  ]);

  const toggleInstanceState = (id: string) => {
    setInstances(prev =>
      prev.map(inst => {
        if (inst.id === id) {
          const nextState = inst.state === 'running' ? 'stopped' : 'running';
          return {
            ...inst,
            state: nextState,
            publicIp: nextState === 'running' ? '13.234.99.12' : '-',
          };
        }
        return inst;
      })
    );
  };

  const handleLaunchInstance = () => {
    const newInst: EC2Instance = {
      id: `i-0${Math.random().toString(16).substring(2, 11)}`,
      name: `santoge-app-${Date.now().toString().slice(-4)}`,
      type: 't3.medium',
      state: 'running',
      publicIp: '13.234.88.42',
      privateIp: '10.0.1.99',
      az: 'ap-south-1a',
    };
    setInstances(prev => [newInst, ...prev]);
  };

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[700px]">
      {/* AWS Console Navbar */}
      <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm tracking-wide">
            <Cloud className="w-5 h-5" /> AWS Console Simulator
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
            Account: 9482-1049-3321 (SantoGe Sandbox)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-medium"
            >
              <option value="ap-south-1 (Mumbai)" className="bg-slate-900">ap-south-1 (Mumbai)</option>
              <option value="us-east-1 (N. Virginia)" className="bg-slate-900">us-east-1 (N. Virginia)</option>
              <option value="eu-west-1 (Ireland)" className="bg-slate-900">eu-west-1 (Ireland)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Services Menu */}
        <div className="w-52 bg-slate-950 border-r border-slate-800 p-2 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Services
          </p>
          <button
            onClick={() => setActiveService('ec2')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold',
              activeService === 'ec2' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
            )}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>EC2 Compute</span>
          </button>
          <button
            onClick={() => setActiveService('s3')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold',
              activeService === 's3' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
            )}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>S3 Storage</span>
          </button>
          <button
            onClick={() => setActiveService('iam')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold',
              activeService === 'iam' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:bg-slate-800'
            )}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span>IAM Security</span>
          </button>
          <button
            onClick={() => setActiveService('cloudwatch')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold',
              activeService === 'cloudwatch' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:bg-slate-800'
            )}
          >
            <Activity className="w-4 h-4 text-violet-400" />
            <span>CloudWatch Metrics</span>
          </button>
          <button
            onClick={() => setActiveService('billing')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-xs font-semibold',
              activeService === 'billing' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            )}
          >
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>Cost & Billing</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-900">
          {activeService === 'ec2' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">EC2 Instances ({instances.length})</h3>
                  <p className="text-xs text-slate-400">Virtual cloud servers deployed in {region}</p>
                </div>
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleLaunchInstance}>
                  Launch Instance
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Instance ID</th>
                      <th className="p-3">Instance Type</th>
                      <th className="p-3">State</th>
                      <th className="p-3">Public IPv4</th>
                      <th className="p-3">Private IP</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {instances.map(inst => (
                      <tr key={inst.id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-sans font-bold text-white">{inst.name}</td>
                        <td className="p-3 text-brand-400">{inst.id}</td>
                        <td className="p-3 text-slate-300">{inst.type}</td>
                        <td className="p-3 font-sans">
                          {inst.state === 'running' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> running
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                              stopped
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">{inst.publicIp}</td>
                        <td className="p-3 text-slate-400">{inst.privateIp}</td>
                        <td className="p-3 font-sans">
                          <button
                            onClick={() => toggleInstanceState(inst.id)}
                            className={clsx(
                              'px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors',
                              inst.state === 'running'
                                ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                            )}
                          >
                            {inst.state === 'running' ? 'Stop' : 'Start'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeService === 's3' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Amazon S3 Buckets</h3>
                  <p className="text-xs text-slate-400">Object storage with 99.999999999% (11 9s) durability</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {s3Buckets.map(b => (
                  <div key={b.name} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white truncate">{b.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Region: {b.region}</p>
                    <p className="text-[11px] text-emerald-400">{b.access}</p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                      <span>{b.objectsCount} objects</span>
                      <span className="font-bold text-brand-400">{b.sizeGB} GB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeService === 'iam' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">IAM Security & Least-Privilege Policies</h3>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="font-bold text-amber-400 mb-2">Active Policy: S3ReadOnlyAndEC2SelfRestart</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::santoge-resumes-prod/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["ec2:DescribeInstances", "ec2:StartInstances", "ec2:StopInstances"],
      "Resource": "*"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeService === 'cloudwatch' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">CloudWatch Health & Alarm Telemetry</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs">CPU Utilization (Average)</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">18.4%</p>
                  <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[18%]" />
                  </div>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs">Network In/Out Throughput</span>
                  <p className="text-2xl font-bold text-brand-400 mt-1">24.2 MB/s</p>
                  <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-[42%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeService === 'billing' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">AWS Cost Management & Forecast</h3>
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs">Estimated Monthly Sandbox Spend</span>
                  <h2 className="text-3xl font-bold text-emerald-400 mt-1">$48.20</h2>
                  <span className="text-slate-500 text-[11px]">Free Tier Credits Applied: $100.00</span>
                </div>
                <Badge variant="success" size="md">Under Budget</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
