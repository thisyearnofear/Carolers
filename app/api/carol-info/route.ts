import { getCarolInfo } from '@/lib/carol-recommendations';
import { getEventMessages } from '@/lib/messages';

export async function POST(request: Request) {
  try {
    const { title, artist, eventTheme = 'general' } = await request.json();

    if (!title || !artist) {
      return Response.json(
        { error: 'Missing title or artist' },
        { status: 400 }
      );
    }

    const info = await getCarolInfo(title, artist, eventTheme);

    return Response.json({ info });
  } catch (error) {
    console.error('Error in carol-info route:', error);
    return Response.json(
      { error: 'Failed to generate carol info' },
      { status: 500 }
    );
  }
}
