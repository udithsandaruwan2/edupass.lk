import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: string;
  name: string;
  amount: number;
}

const rows: Row[] = Array.from({ length: 23 }, (_, i) => ({ id: `r${i}`, name: `Name ${String(i).padStart(2, '0')}`, amount: (i * 37) % 100 }));
const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'amount', header: 'Amount', render: (r) => String(r.amount), sortValue: (r) => r.amount },
];

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

describe('DataTable', () => {
  it('paginates rows', async () => {
    render(<DataTable rows={rows} columns={columns} rowKey={(r) => r.id} caption="Test" pageSize={10} />);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText('1–10 of 23')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('11–20 of 23')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('filters with the search box', async () => {
    render(<DataTable rows={rows} columns={columns} rowKey={(r) => r.id} caption="Test" searchText={(r) => r.name} />);
    await userEvent.type(screen.getByRole('searchbox'), 'Name 1');
    // Name 01 and Name 10–19
    expect(bodyRows()).toHaveLength(10);
    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('sorts numerically and toggles direction', async () => {
    render(<DataTable rows={rows.slice(0, 5)} columns={columns} rowKey={(r) => r.id} caption="Test" />);
    const header = screen.getByRole('button', { name: /amount/i });
    await userEvent.click(header);
    const asc = bodyRows().map((r) => Number(within(r).getAllByRole('cell')[1]!.textContent));
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(screen.getByRole('columnheader', { name: /amount/i })).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(header);
    expect(screen.getByRole('columnheader', { name: /amount/i })).toHaveAttribute('aria-sort', 'descending');
  });
});
