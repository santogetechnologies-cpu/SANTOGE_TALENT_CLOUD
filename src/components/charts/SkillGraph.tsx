import React from 'react';
import { KnowledgeGraphNode } from '../../types/learning';
import { CheckCircle, Clock, Lock, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const SkillGraph: React.FC<{ nodes: KnowledgeGraphNode[]; onSelectNode?: (node: KnowledgeGraphNode) => void }> = ({
  nodes,
  onSelectNode,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-x-auto shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" /> Interactive Skill Relationship Knowledge Graph
          </h3>
          <p className="text-xs text-slate-400">Prerequisite dependency tree from foundations to production cloud systems</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Mastered</span>
          <span className="flex items-center gap-1 text-brand-400 font-semibold"><Clock className="w-3.5 h-3.5" /> In Progress</span>
          <span className="flex items-center gap-1 text-slate-500"><Lock className="w-3.5 h-3.5" /> Locked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 min-w-[700px]">
        {nodes.map(node => {
          const isMastered = node.status === 'MASTERED';
          const isInProgress = node.status === 'IN_PROGRESS';
          const isUnlocked = node.status === 'UNLOCKED';

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node)}
              className={clsx(
                'p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden',
                isMastered && 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
                isInProgress && 'bg-brand-950/40 border-brand-500/50 text-brand-300 hover:border-brand-400 shadow-glow-brand',
                isUnlocked && 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500',
                node.status === 'LOCKED' && 'bg-slate-950/60 border-slate-800/80 text-slate-600 opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
                  {node.category}
                </span>
                {isMastered && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {isInProgress && <Clock className="w-4 h-4 text-brand-400 animate-spin" />}
                {node.status === 'LOCKED' && <Lock className="w-4 h-4 text-slate-600" />}
              </div>

              <h4 className="font-bold text-white text-xs mb-1">{node.label}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {node.description}
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="font-mono text-brand-400 font-bold">+{node.xpPoints} XP</span>
                <span className="text-slate-500 font-medium">
                  {node.dependencies.length > 0 ? `Requires ${node.dependencies.length} prereq` : 'Root'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
