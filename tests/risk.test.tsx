import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../messages/en.json';
import { RiskBadge } from '@/components/risk/RiskBadge';
import { RiskSummaryTiles } from '@/components/risk/RiskSummaryTiles';
import { RiskDetails } from '@/components/risk/RiskDetails';
import { PhoneSearchBox } from '@/components/risk/PhoneSearchBox';
import type { RiskCheckDTO } from '@/types/risk';

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('RiskBadge', () => {
  it('renders correct labels for risk levels', () => {
    const { rerender } = renderWithIntl(<RiskBadge level="LOW" />);
    expect(screen.getByText('Low risk')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <RiskBadge level="MEDIUM" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Medium risk')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <RiskBadge level="HIGH" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('High risk')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <RiskBadge level="UNKNOWN" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders score when showScore is true', () => {
    renderWithIntl(<RiskBadge level="LOW" score={15} showScore />);
    expect(screen.getByText('(15)')).toBeInTheDocument();
  });
});

describe('RiskSummaryTiles', () => {
  it('renders summary values with English digits and percentage', () => {
    renderWithIntl(
      <RiskSummaryTiles
        summary={{
          totalOrders: 12,
          receivedOrders: 10,
          cancelledOrReturnedOrders: 2,
          successRate: 0.83,
        }}
      />,
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('83%')).toBeInTheDocument();
  });
});

describe('RiskDetails', () => {
  const mockRisk: RiskCheckDTO = {
    id: 'chk_123',
    phone: '01711223344',
    score: 25,
    level: 'LOW',
    recommendation: 'ACCEPT_COD',
    reasons: ['HIGH_SUCCESS_RATE', 'REPEAT_GOOD_CUSTOMER'],
    summary: {
      totalOrders: 10,
      receivedOrders: 9,
      cancelledOrReturnedOrders: 1,
      successRate: 0.9,
    },
    network: {
      shops: 3,
      total: 8,
      delivered: 7,
      returned: 1,
      cancelled: 0,
    },
    external: {
      courier: 'STEADFAST',
      total: 2,
      delivered: 2,
      cancelled: 0,
    },
    internal: {
      total: 3,
      delivered: 3,
      returned: 0,
      cancelled: 0,
      isBlocked: false,
      fraudReportsCount: 0,
    },
    cached: false,
    checkedAt: new Date().toISOString(),
  };

  it('renders complete risk assessment and privacy guarantee', () => {
    renderWithIntl(<RiskDetails data={mockRisk} />);

    expect(screen.getByText('01711223344')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Accept COD')).toBeInTheDocument();
    expect(
      screen.getByText('High successful delivery rate across network'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Repeat successful buyer in your shop'),
    ).toBeInTheDocument();
    expect(screen.getByText('Across 3 independent shops')).toBeInTheDocument();
    expect(screen.getByText('Privacy Guaranteed:')).toBeInTheDocument();
  });
});

describe('PhoneSearchBox', () => {
  it('validates BD phone numbers before submitting', () => {
    const handleSearch = vi.fn();
    renderWithIntl(<PhoneSearchBox onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText(/Enter phone number/i);
    const submitBtn = screen.getByRole('button', { name: /Check risk/i });

    // Invalid phone
    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(submitBtn);
    expect(handleSearch).not.toHaveBeenCalled();
    expect(
      screen.getByText(/valid 11-digit Bangladeshi mobile number/i),
    ).toBeInTheDocument();

    // Valid BD phone
    fireEvent.change(input, { target: { value: '01711223344' } });
    fireEvent.click(submitBtn);
    expect(handleSearch).toHaveBeenCalledWith('01711223344');
  });
});
