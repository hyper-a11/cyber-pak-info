from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json(silent=True) or {}
        search_query = str(data.get('query', '')).strip()

        # ❌ Empty input
        if not search_query:
            return jsonify({
                'success': False,
                'error': 'Please enter a valid number or CNIC'
            }), 400

        # 🔁 Form Data
        form_data = {
            'post_id': '413',
            'form_id': '5e17544',
            'referer_title': 'Search SIM and CNIC Details - Instant Ownership Check',
            'queried_id': '413',
            'form_fields[search]': search_query,
            'action': 'elementor_pro_forms_send_form',
            'referrer': 'https://simownership.com/search/'
        }

        # 🔁 Headers
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://simownership.com',
            'Referer': 'https://simownership.com/search/'
        }

        # 🔁 API Request
        response = requests.post(
            'https://simownership.com/wp-admin/admin-ajax.php',
            headers=headers,
            data=form_data,
            timeout=30
        )

        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': 'Service temporarily unavailable'
            }), 503

        # ✅ Safe JSON parse
        try:
            api_data = response.json()
        except:
            return jsonify({
                'success': False,
                'error': 'Invalid API response'
            }), 500

        results = (
            api_data.get('data', {})
                    .get('data', {})
                    .get('results', [])
        )

        if api_data.get('success') and results:
            return jsonify({
                'success': True,
                'results': results,
                'count': len(results)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No records found'
            }), 404

    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'Request timeout'
        }), 504

    except requests.exceptions.RequestException:
        return jsonify({
            'success': False,
            'error': 'Network error'
        }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# 🚀 Run Server
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
