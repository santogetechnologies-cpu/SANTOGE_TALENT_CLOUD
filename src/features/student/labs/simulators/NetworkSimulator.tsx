import React, { useState } from 'react';
import { Network, Server, Router, Shield, Laptop, Play, CheckCircle2, RefreshCw, Radio } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

export const NetworkSimulator: React.FC = () => {
  const [ipInput, setIpInput] = useState('192.168.10.45');
  const [cidr, setCidr] = useState(26);
  const [pingTarget, setPingTarget] = useState('192.168.10.1');
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'subnet' | 'vlan'>('topology');

  // Subnet Calculation logic
  const calculateSubnet = () => {
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalHosts - 2);
    const maskOctets = [];
    let bits = cidr;
    for (let i = 0; i < 4; i++) {
      if (bits >= 8) {
        maskOctets.push(255);
        bits -= 8;
      } else if (bits > 0) {
        maskOctets.push(256 - Math.pow(2, 8 - bits));
        bits = 0;
      } else {
        maskOctets.push(0);
      }
    }
    return {
      mask: maskOctets.join('.'),
      totalHosts,
      usableHosts,
      networkAddr: '192.168.10.0',
      firstHost: '192.168.10.1',
      lastHost: `192.168.10.${usableHosts}`,
      broadcast: `192.168.10.${totalHosts - 1}`,
    };
  };

  const subnetInfo = calculateSubnet();

  const handlePing = () => {
    setIsPinging(true);
    setPingLogs([
      `PING ${pingTarget} (56 data bytes)`,
      `64 bytes from ${pingTarget}: icmp_seq=1 ttl=64 time=0.482 ms`,
      `64 bytes from ${pingTarget}: icmp_seq=2 ttl=64 time=0.412 ms`,
      `64 bytes from ${pingTarget}: icmp_seq=3 ttl=64 time=0.395 ms`,
      `64 bytes from ${pingTarget}: icmp_seq=4 ttl=64 time=0.420 ms`,
      `--- ${pingTarget} ping statistics ---`,
      `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
      `rtt min/avg/max/mdev = 0.395/0.427/0.482/0.033 ms`,
    ]);
    setTimeout(() => setIsPinging(false), 600);
  };

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[700px]">
      {/* Titlebar */}
      <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
          <Network className="w-5 h-5" /> Enterprise Network Rack & Packet Flow Simulator
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('topology')}
            className={clsx('px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer', activeTab === 'topology' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white')}
          >
            Rack Topology
          </button>
          <button
            onClick={() => setActiveTab('subnet')}
            className={clsx('px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer', activeTab === 'subnet' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white')}
          >
            CIDR Subnet Calculator
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
        {activeTab === 'topology' && (
          <div className="space-y-6">
            {/* Visual Topology Diagram */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative">
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-wider">
                Enterprise Layer 3 Network Rack Architecture
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center">
                {/* Edge Router */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative group hover:border-cyan-500/50 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Router className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-white text-xs">Cisco Core Router</p>
                  <p className="font-mono text-[10px] text-slate-400">192.168.10.1 (Gi0/0)</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Link Up
                  </span>
                </div>

                {/* Firewall */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative group hover:border-rose-500/50 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-rose-950/80 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-white text-xs">Palo Alto NextGen FW</p>
                  <p className="font-mono text-[10px] text-slate-400">192.168.10.2 (eth1/1)</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">NAT / IPS Active</span>
                </div>

                {/* Switch */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative group hover:border-amber-500/50 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-white text-xs">Catalyst 3850 Switch</p>
                  <p className="font-mono text-[10px] text-slate-400">VLAN 10 / Trunk Mode</p>
                  <span className="text-[10px] text-amber-400 font-semibold">48 Ports Active</span>
                </div>

                {/* Host */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative group hover:border-brand-500/50 transition-colors">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-brand-950/80 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-white text-xs">Host Workstation 01</p>
                  <p className="font-mono text-[10px] text-slate-400">192.168.10.45/26</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">DHCP Bound</span>
                </div>
              </div>
            </div>

            {/* Packet Tracer Ping Box */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Radio className="w-4 h-4 text-emerald-400" /> Interactive ICMP Ping Tracer
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pingTarget}
                    onChange={e => setPingTarget(e.target.value)}
                    placeholder="Target IP"
                    className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono text-white outline-none"
                  />
                  <Button size="xs" variant="success" leftIcon={<Play className="w-3 h-3" />} onClick={handlePing} isLoading={isPinging}>
                    Ping Target
                  </Button>
                </div>
              </div>

              {pingLogs.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 space-y-0.5 border border-slate-800">
                  {pingLogs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subnet' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">IPv4 CIDR Subnet Calculator</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">IP Address:</label>
                  <input
                    type="text"
                    value={ipInput}
                    onChange={e => setIpInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">CIDR Prefix (/{cidr}):</label>
                  <input
                    type="range"
                    min="16"
                    max="30"
                    value={cidr}
                    onChange={e => setCidr(Number(e.target.value))}
                    className="w-full mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Subnet Mask</span>
                  <span className="text-emerald-400 font-bold text-sm">{subnetInfo.mask}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Usable Hosts</span>
                  <span className="text-cyan-400 font-bold text-sm">{subnetInfo.usableHosts} hosts</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Network ID</span>
                  <span className="text-slate-300 font-bold">{subnetInfo.networkAddr}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Broadcast Address</span>
                  <span className="text-amber-400 font-bold">{subnetInfo.broadcast}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
