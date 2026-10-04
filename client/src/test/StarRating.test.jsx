import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../components/StarRating.jsx';

describe('StarRating Component', () => {
  it('renders 5 star rating buttons in interactive mode', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);
  });

  it('renders correctly in readOnly mode', () => {
    render(<StarRating value={4} readOnly />);
    const group = screen.getByRole('img');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Rating 4 out of 5 stars');
  });

  it('calls onChange with star value when clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating value={0} onChange={handleChange} />);
    const buttons = screen.getAllByRole('radio');
    fireEvent.click(buttons[3]);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange when readOnly is true', () => {
    const handleChange = vi.fn();
    render(<StarRating value={2} onChange={handleChange} readOnly />);
    const group = screen.getByRole('img');
    fireEvent.click(group);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation via arrow keys', () => {
    const handleChange = vi.fn();
    render(<StarRating value={2} onChange={handleChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('renders numerical text when showText is true', () => {
    render(<StarRating value={4.5} readOnly showText />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
