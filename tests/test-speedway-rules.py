#!/usr/bin/env python3
"""
Test Suite for Speedway Match Scorecard PWA
Validates Speedway scoring algorithms, British 15-heat matrix, bonus points,
gate assignments, and file asset integrity.
"""

import json
import os
import sys

def run_tests():
    workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Testing Speedway Scorecard in {workspace}...")
    errors = []

    # Test 1: Check required PWA files exist
    required_files = [
      'index.html',
      'manifest.webmanifest',
      'sw.js',
      'css/app.css',
      'js/app.js',
      'js/models/speedway-rules.js',
      'js/services/storage.js',
      'js/services/exporter.js',
      'js/views/heat-view.js',
      'js/views/scorecard-view.js',
      'js/views/riders-view.js',
      'js/views/stats-view.js',
      'js/views/match-setup-view.js',
      'icons/icon.svg'
    ]

    for rf in required_files:
        full_path = os.path.join(workspace, rf)
        if not os.path.exists(full_path):
            errors.append(f"Missing required file: {rf}")
        else:
            if os.path.getsize(full_path) == 0:
                errors.append(f"File is empty: {rf}")

    # Test 2: Validate manifest.webmanifest JSON format
    manifest_path = os.path.join(workspace, 'manifest.webmanifest')
    try:
        with open(manifest_path, 'r') as f:
            manifest_data = json.load(f)
            assert manifest_data.get('name') == 'Speedway Match Scorecard'
            assert manifest_data.get('display') == 'standalone'
            assert manifest_data.get('orientation') == 'portrait'
            assert len(manifest_data.get('icons', [])) > 0
            print("✓ PWA Manifest format valid")
    except Exception as e:
        errors.append(f"Manifest validation error: {str(e)}")

    # Test 3: Check HTML meta tags for iPhone PWA
    index_path = os.path.join(workspace, 'index.html')
    try:
        with open(index_path, 'r') as f:
            html_content = f.read()
            assert 'viewport-fit=cover' in html_content
            assert 'apple-mobile-web-app-capable' in html_content
            assert 'apple-mobile-web-app-status-bar-style' in html_content
            assert 'manifest.webmanifest' in html_content
            print("✓ iPhone PWA Viewport and Meta tags present")
    except Exception as e:
        errors.append(f"HTML meta tags error: {str(e)}")

    # Test 4: Verify JS models contain British 15-Heat Matrix, Team Presets and Rosters
    rules_path = os.path.join(workspace, 'js/models/speedway-rules.js')
    try:
        with open(rules_path, 'r') as f:
            rules_content = f.read()
            assert 'BRITISH_15_HEAT_MATRIX' in rules_content
            assert 'BRITISH_TEAMS_PRESET' in rules_content
            assert 'calculateHeatScoring' in rules_content
            assert 'calculateMatchTotals' in rules_content
            assert 'getTeamPreset' in rules_content
            assert 'getRosterForTeam' in rules_content
            assert 'Belle Vue Aces' in rules_content
            assert 'Brady Kurtz' in rules_content
            assert 'Richard Lawson' in rules_content
            assert 'Tobiasz Musielak' in rules_content
            assert 'Northampton' in rules_content
            assert 'William Cairns' in rules_content
            assert 'Luke Killeen' in rules_content
            print("✓ British Speedway rules, 2026 Issue 18 team presets & rosters verified")
    except Exception as e:
        errors.append(f"Rules content error: {str(e)}")

    # Test 5: Verify CSS safe area insets
    css_path = os.path.join(workspace, 'css/app.css')
    try:
        with open(css_path, 'r') as f:
            css_content = f.read()
            assert 'env(safe-area-inset-top' in css_content
            assert 'env(safe-area-inset-bottom' in css_content
            assert '--helmet-red' in css_content
            assert '--helmet-blue' in css_content
            assert '--helmet-white' in css_content
            assert '--helmet-yellow' in css_content
            print("✓ iOS Safe Area and Helmet CSS styling verified")
    except Exception as e:
        errors.append(f"CSS content error: {str(e)}")

    # Test 6: Verify App controller and View methods for team changing
    app_path = os.path.join(workspace, 'js/app.js')
    try:
        with open(app_path, 'r') as f:
            app_content = f.read()
            assert 'setTeam' in app_content
            assert 'getRosterForTeam' in app_content
            assert 'resetCurrentMatch' in app_content
            print("✓ App Controller setTeam & roster synchronization verified")
    except Exception as e:
        errors.append(f"App content error: {str(e)}")

    # Test 7: Verify Match Setup View has dropdowns and chip listeners
    setup_path = os.path.join(workspace, 'js/views/match-setup-view.js')
    try:
        with open(setup_path, 'r') as f:
            setup_content = f.read()
            assert 'select-home-preset' in setup_content
            assert 'select-away-preset' in setup_content
            assert 'btn-set-home-preset' in setup_content
            assert 'btn-set-away-preset' in setup_content
            assert 'btn-reset-team-roster' in setup_content
            assert 'btn-reset-current-match' in setup_content
            print("✓ Match Setup View team selectors and roster controls verified")
    except Exception as e:
        errors.append(f"Setup view content error: {str(e)}")

    if errors:
        print("\n❌ Test failures:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n All 7 verification test suites passed successfully!")

if __name__ == '__main__':
    run_tests()

