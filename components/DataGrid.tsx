'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from 'ag-grid-community';
// Using Theming API (no CSS theme files)
import { Button } from '@/components/ui/button';

export interface DataGridProps<T extends object> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  onLoadMore?: () => void; // called as user scrolls near bottom
  hasMore?: boolean;
  height?: number | string;
  onExportCsv?: () => void; // optional custom export
  getRowId?: (data: T) => string;
}

// Register once at module scope
ModuleRegistry.registerModules?.([AllCommunityModule]);

export function DataGrid<T extends object>({
  rowData,
  columnDefs,
  onLoadMore,
  hasMore = false,
  height = 520,
  onExportCsv,
  getRowId,
}: DataGridProps<T>) {
  const apiRef = useRef<GridApi | null>(null);

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    apiRef.current = event.api;
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleBodyScroll = useCallback(() => {
    if (!onLoadMore || !apiRef.current) return;
    const gridBody = apiRef.current.getDisplayedRowCount();
    const lastDisplayed = apiRef.current.getLastDisplayedRowIndex();
    // When user is within last 20 rows, try load more
    if (hasMore && gridBody > 0 && lastDisplayed >= gridBody - 20) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore]);

  const exportCsv = useCallback(() => {
    if (onExportCsv) return onExportCsv();
    apiRef.current?.exportDataAsCsv({
      fileName: 'export.csv',
      columnSeparator: ',',
    });
  }, [onExportCsv]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <div
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        onScroll={handleBodyScroll}
      >
        <AgGridReact<T>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={handleGridReady}
          theme={themeQuartz}
          getRowId={
            getRowId ? (params) => getRowId(params.data as T) : undefined
          }
          rowSelection={{ mode: 'singleRow' }}
          animateRows
        />
      </div>
    </div>
  );
}
