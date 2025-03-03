"use client";

import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const GridComponent = ({ rows, cols }: { rows: any[], cols: ColDef[] }) => {
  // const [rowData, setRowData] = useState<any[]>([]);

  // const [columnDefs, setColumnDefs] = useState<ColDef[]>([
  //   { field: "athlete" },
  //   { field: "age" },
  //   { field: "date" },
  //   { field: "country" },
  //   { field: "sport" },
  //   { field: "gold" },
  //   { field: "silver" },
  //   { field: "bronze" },
  //   { field: "total" },
  // ]);

  // useEffect(() => {
  //   fetch("https://www.ag-grid.com/example-assets/olympic-winners.json") // Fetch data from server
  //     .then((result) => result.json()) // Convert to JSON
  //     .then((rowData) => setRowData(rowData)); // Update state of `rowData`
  // }, []);

  // console.log(rowData)

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <AgGridReact rowData={rows} columnDefs={cols} />
    </div>
  );
};

export default GridComponent;
