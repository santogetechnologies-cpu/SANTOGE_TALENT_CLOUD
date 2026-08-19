import React, { useState } from 'react';
import { Layers, FileText, CheckCircle2, ShoppingCart, Truck, Receipt, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

export const SAPSimulator: React.FC = () => {
  const [tCode, setTCode] = useState('VA01');
  const [activeScreen, setActiveScreen] = useState<'VA01' | 'ME21N' | 'MM03' | 'STATUS'>('VA01');
  const [orderData, setOrderData] = useState({
    orderType: 'OR (Standard Order)',
    salesOrg: '1000 (SantoGe Global)',
    distChannel: '10 (Direct B2B)',
    division: '00 (Cross-Division)',
    soldToParty: 'CUST-10492 (Apex Tech Enterprises)',
    material: 'MAT-9901 (Enterprise Cloud License)',
    quantity: '50',
    amount: '₹7,50,000',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = tCode.toUpperCase().trim();
    if (code === 'VA01' || code === 'ME21N' || code === 'MM03') {
      setActiveScreen(code as any);
      setStatusMessage(null);
    } else {
      setStatusMessage(`Transaction ${code} does not exist or is not authorized in client 800.`);
    }
  };

  const handlePostOrder = () => {
    const orderNumber = `SO-${Math.floor(100000 + Math.random() * 900000)}`;
    setStatusMessage(`Standard Order ${orderNumber} has been saved and posted to S/4HANA Ledger successfully.`);
  };

  return (
    <div className="bg-[#d4d0c8] text-slate-900 rounded-2xl border-4 border-[#808080] shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[700px]">
      {/* SAP GUI Classic Menu Header */}
      <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-300" />
          <span>SAP Easy Access — SantoGe S/4HANA Enterprise Simulation (Client 800)</span>
        </div>
        <span className="font-mono text-[11px] text-amber-300">USER: S_CONSULTANT</span>
      </div>

      {/* SAP Toolbar & T-Code Box */}
      <div className="bg-[#ece9d8] p-2 border-b border-[#aca899] flex items-center gap-3">
        <form onSubmit={handleTCodeSubmit} className="flex items-center gap-1.5">
          <label className="font-bold text-slate-800 text-xs">Command:</label>
          <div className="relative">
            <input
              type="text"
              value={tCode}
              onChange={e => setTCode(e.target.value)}
              className="bg-white border border-[#7f9db9] px-2 py-0.5 w-24 font-mono font-bold text-xs uppercase text-slate-900 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-[#d4d0c8] hover:bg-[#ece9d8] border border-[#808080] p-1 rounded cursor-pointer shadow-xs active:border-slate-800"
            title="Execute T-Code"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-emerald-800 font-bold" />
          </button>
        </form>

        <div className="flex items-center gap-1 ml-auto text-xs">
          <button
            onClick={() => { setTCode('VA01'); setActiveScreen('VA01'); }}
            className={clsx(
              'px-2.5 py-1 border font-bold rounded cursor-pointer',
              activeScreen === 'VA01' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-[#ece9d8] text-slate-800 border-[#808080]'
            )}
          >
            VA01 (Sales Order)
          </button>
          <button
            onClick={() => { setTCode('ME21N'); setActiveScreen('ME21N'); }}
            className={clsx(
              'px-2.5 py-1 border font-bold rounded cursor-pointer',
              activeScreen === 'ME21N' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-[#ece9d8] text-slate-800 border-[#808080]'
            )}
          >
            ME21N (Purchase Order)
          </button>
          <button
            onClick={() => { setTCode('MM03'); setActiveScreen('MM03'); }}
            className={clsx(
              'px-2.5 py-1 border font-bold rounded cursor-pointer',
              activeScreen === 'MM03' ? 'bg-[#000080] text-white border-[#000080]' : 'bg-[#ece9d8] text-slate-800 border-[#808080]'
            )}
          >
            MM03 (Material Master)
          </button>
        </div>
      </div>

      {/* Main SAP Form Area */}
      <div className="flex-1 bg-white p-6 overflow-y-auto font-sans">
        {activeScreen === 'VA01' && (
          <div className="max-w-3xl mx-auto border border-[#aca899] bg-[#f9f9f9] p-6 rounded-lg shadow-sm">
            <div className="border-b border-[#aca899] pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#000080]">Create Sales Order: Initial Screen (T-Code: VA01)</h2>
                <p className="text-xs text-slate-600">Enterprise Order-to-Cash (O2C) Business Process</p>
              </div>
              <Badge variant="primary">SD / Order-to-Cash</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Order Type:</label>
                <input
                  type="text"
                  value={orderData.orderType}
                  readOnly
                  className="w-full bg-[#f0f0f0] border border-[#7f9db9] p-1.5 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sales Organization:</label>
                <input
                  type="text"
                  value={orderData.salesOrg}
                  readOnly
                  className="w-full bg-[#f0f0f0] border border-[#7f9db9] p-1.5 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Distribution Channel:</label>
                <input
                  type="text"
                  value={orderData.distChannel}
                  readOnly
                  className="w-full bg-[#f0f0f0] border border-[#7f9db9] p-1.5 rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sold-To Party (Customer):</label>
                <input
                  type="text"
                  value={orderData.soldToParty}
                  onChange={e => setOrderData({ ...orderData, soldToParty: e.target.value })}
                  className="w-full bg-white border border-[#7f9db9] p-1.5 rounded font-mono focus:bg-amber-50 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Material / Item:</label>
                <input
                  type="text"
                  value={orderData.material}
                  onChange={e => setOrderData({ ...orderData, material: e.target.value })}
                  className="w-full bg-white border border-[#7f9db9] p-1.5 rounded font-mono focus:bg-amber-50 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Order Quantity:</label>
                <input
                  type="number"
                  value={orderData.quantity}
                  onChange={e => setOrderData({ ...orderData, quantity: e.target.value })}
                  className="w-full bg-white border border-[#7f9db9] p-1.5 rounded font-mono focus:bg-amber-50 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Net Valuation Amount:</label>
                <input
                  type="text"
                  value={orderData.amount}
                  readOnly
                  className="w-full bg-[#f0f0f0] border border-[#7f9db9] p-1.5 rounded font-mono font-bold text-emerald-800"
                />
              </div>
            </div>

            {/* Document Flow Breadcrumb */}
            <div className="mt-6 pt-4 border-t border-[#aca899]">
              <p className="text-[11px] font-bold text-slate-600 mb-2">Simulated Document Flow:</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-brand-100 text-brand-900 rounded font-bold border border-brand-300">
                  1. Sales Order (VA01)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded">
                  2. Outbound Delivery (VL01N)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded">
                  3. Billing Invoice (VF01)
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setStatusMessage('Check passed: Material available in storage location 0001.')}>
                Check Availability (F8)
              </Button>
              <Button variant="primary" size="sm" onClick={handlePostOrder}>
                Save & Post Document (Ctrl+S)
              </Button>
            </div>
          </div>
        )}

        {activeScreen === 'ME21N' && (
          <div className="max-w-3xl mx-auto border border-[#aca899] bg-[#f9f9f9] p-6 rounded-lg">
            <h2 className="text-sm font-bold text-[#000080] mb-2">Create Purchase Order (T-Code: ME21N)</h2>
            <p className="text-xs text-slate-600 mb-4">Procure-to-Pay (P2P) Material Procurement</p>
            <div className="p-4 bg-white border border-[#aca899] rounded font-mono text-xs space-y-2">
              <p><span className="font-bold text-slate-600">Vendor:</span> VEND-50110 (Dell Enterprise Hardware)</p>
              <p><span className="font-bold text-slate-600">Purchasing Org:</span> 1000 (SantoGe Central IT)</p>
              <p><span className="font-bold text-slate-600">Items:</span> 20x PowerEdge R750 Servers @ ₹3,40,000 / unit</p>
              <p><span className="font-bold text-slate-600">PO Status:</span> Released for Goods Receipt (MIGO)</p>
            </div>
          </div>
        )}

        {activeScreen === 'MM03' && (
          <div className="max-w-3xl mx-auto border border-[#aca899] bg-[#f9f9f9] p-6 rounded-lg">
            <h2 className="text-sm font-bold text-[#000080] mb-2">Display Material Master (T-Code: MM03)</h2>
            <p className="text-xs text-slate-600 mb-4">Material Master Data: MAT-9901</p>
            <div className="p-4 bg-white border border-[#aca899] rounded font-mono text-xs space-y-2">
              <p><span className="font-bold text-slate-600">Material Type:</span> HAWA (Trading Goods)</p>
              <p><span className="font-bold text-slate-600">Base Unit of Measure:</span> EA (Each)</p>
              <p><span className="font-bold text-slate-600">Gross Weight:</span> 0.000 KG (Digital Asset)</p>
              <p><span className="font-bold text-slate-600">Valuation Class:</span> 3100 (Software & Cloud)</p>
            </div>
          </div>
        )}
      </div>

      {/* SAP Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#aca899] px-4 py-1 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          {statusMessage ? (
            <span className={clsx('font-bold', statusMessage.includes('saved') ? 'text-emerald-800' : 'text-rose-700')}>
              {statusMessage.includes('saved') ? '✔' : '⚠'} {statusMessage}
            </span>
          ) : (
            <span className="text-slate-600">Ready</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span>System: DEV</span>
          <span>Client: 800</span>
          <span>Ins: 00</span>
        </div>
      </div>
    </div>
  );
};
