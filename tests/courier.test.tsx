import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '../messages/en.json';
import { ShipmentStatusBadge } from '@/components/couriers/ShipmentStatusBadge';
import { CourierCredentialsForm } from '@/components/couriers/CourierCredentialsForm';

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('ShipmentStatusBadge', () => {
  it('renders correct labels for statuses', () => {
    const { rerender } = renderWithIntl(<ShipmentStatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <ShipmentStatusBadge status="IN_TRANSIT" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('In transit')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <ShipmentStatusBadge status="PICKUP_PENDING" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Pickup pending')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <ShipmentStatusBadge status="RETURNED" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Returned')).toBeInTheDocument();
  });
});

describe('CourierCredentialsForm', () => {
  it('renders Steadfast credentials fields', () => {
    renderWithIntl(
      <CourierCredentialsForm
        provider="STEADFAST"
        credentials={{}}
        settings={{}}
        onCredentialsChange={vi.fn()}
        onSettingsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('API Key')).toBeInTheDocument();
    expect(screen.getByText('Secret Key')).toBeInTheDocument();
  });

  it('renders Pathao credentials fields', () => {
    renderWithIntl(
      <CourierCredentialsForm
        provider="PATHAO"
        credentials={{}}
        settings={{}}
        onCredentialsChange={vi.fn()}
        onSettingsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Client ID')).toBeInTheDocument();
    expect(screen.getByText('Client Secret')).toBeInTheDocument();
    expect(screen.getByText('Username / Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders RedX credentials fields', () => {
    renderWithIntl(
      <CourierCredentialsForm
        provider="REDX"
        credentials={{}}
        settings={{}}
        onCredentialsChange={vi.fn()}
        onSettingsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('API Access Token')).toBeInTheDocument();
  });
});
