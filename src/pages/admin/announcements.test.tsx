import { render, fireEvent, waitFor } from '@testing-library/react';
import Announcements from './announcements';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

describe('Announcements', () => {
  it('sends announcements to all users', async () => {
    const users = [
      { id: '1', email: 'test1@test.com', subscribedToAnnouncements: true },
      { id: '2', email: 'test2@test.com', subscribedToAnnouncements: false },
      { id: '3', email: 'test3@test.com' },
    ];

    (getDocs as jest.Mock).mockResolvedValue({
      docs: users.map(user => ({
        id: user.id,
        data: () => user,
      })),
    });
    (addDoc as jest.Mock).mockResolvedValue({ id: 'announcement-id' });

    const { getByPlaceholderText, getByText } = render(<Announcements />);

    fireEvent.change(getByPlaceholderText('New announcement'), {
      target: { value: 'Test Announcement' },
    });
    fireEvent.click(getByText('Add Announcement'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'test1@test.com',
          subject: 'New Announcement from AIAA Zewail City',
          text: 'Test Announcement\n\nTo unsubscribe from future announcements, click here: http://localhost/api/unsubscribe?userId=1',
        }),
      });
      expect(fetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'test3@test.com',
          subject: 'New Announcement from AIAA Zewail City',
          text: 'Test Announcement\n\nTo unsubscribe from future announcements, click here: http://localhost/api/unsubscribe?userId=3',
        }),
      });
    });
  });
});
