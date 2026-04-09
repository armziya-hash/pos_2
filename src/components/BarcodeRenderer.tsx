"use client"
import React from 'react';
import Barcode from 'react-barcode';

export default function BarcodeRenderer({ value }: { value: string }) {
   if(!value) return <span className="text-slate-400 text-xs italic">No Barcode</span>;
   return (
      <div className="bg-white p-1 rounded inline-block">
        <Barcode value={value} width={1.2} height={30} fontSize={10} margin={0} displayValue={true} />
      </div>
   );
}
