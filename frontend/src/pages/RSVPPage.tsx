import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function RSVPPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">RSVP</h1>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">
            We can't wait to celebrate with you! Please let us know if you can make it.
          </p>

          <form className="space-y-6">
            {/* Guest Name (will be pre-filled from API) */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                disabled
                value="[Guest Name]"
                className="w-full px-4 py-2 border rounded-md bg-gray-50"
              />
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-medium mb-2">Will you be attending?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="yes"
                    className="mr-2"
                  />
                  Joyfully accepts
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    className="mr-2"
                  />
                  Regretfully declines
                </label>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Dietary Restrictions (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-md"
                rows={3}
                placeholder="Please let us know of any dietary restrictions or allergies"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message to the Couple (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-md"
                rows={3}
                placeholder="Leave us a message"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit RSVP
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Code: {code}
          </p>
        </div>
      </div>
    </Layout>
  );
}
