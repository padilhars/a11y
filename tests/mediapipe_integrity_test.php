<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace local_a11y;

/**
 * Guards the locally-packaged MediaPipe WASM fileset (mediapipe/wasm/)
 * against silent corruption or tampering (D79).
 *
 * This is the closest thing to a real integrity check these 4 files can
 * get: MediaPipe's own public API (`FilesetResolver.forVisionTasks()`)
 * only accepts a base *path* for the WASM fileset (`WasmFileset`'s
 * `wasmLoaderPath`/`wasmBinaryPath` are plain strings) - unlike the face
 * landmarker model, which does accept pre-verified bytes via
 * `modelAssetBuffer` (see amd/src/face_navigation.js's own
 * fetchVerifiedBytes()/MP_MODEL_SHA256), there is no browser-runtime hook
 * to hash-check these 4 files before MediaPipe loads them - confirmed
 * against the package's own vision.d.ts before concluding this, not
 * assumed (see audit/02-seguranca.md's Achado 1 and DECISIONS.md D79 for
 * the full history). What a test *can* do, and this one does, is catch a
 * regression in the one place still fully in this project's control: the
 * exact bytes committed to this repository. If these ever drift from the
 * pinned hashes below - an accidental partial re-download, a bad merge, a
 * tampered commit - this fails loudly in CI instead of silently shipping
 * a MediaPipe build nobody actually reviewed.
 *
 * Update the pinned hashes here (and MP_CDN's version comment in
 * amd/src/face_navigation.js) together, deliberately, whenever the
 * @mediapipe/tasks-vision package version bundled in mediapipe/wasm/ is
 * upgraded - never to silence a failure without first confirming why the
 * files actually changed.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversNothing]
final class mediapipe_integrity_test extends \advanced_testcase {
    /**
     * Pinned SHA-256 (hex) of each bundled WASM fileset file, as downloaded
     * from @mediapipe/tasks-vision@0.10.18 at packaging time.
     *
     * @var array<string, string>
     */
    private const EXPECTED_SHA256 = [
        'vision_wasm_internal.js' => '2b120e1c7272905719f7893e5f09e033ead468b46b510e6b490d93e3d94ec69c',
        'vision_wasm_internal.wasm' => '35d67ac01df034a04a38cb0533d6438595bcc65c485aed61dd47c86c6c3839cd',
        'vision_wasm_nosimd_internal.js' => 'd206ba4e27c42a5863b4001c6d9366345f4507979cd6efd087a149ef7781ccd3',
        'vision_wasm_nosimd_internal.wasm' => '17c2bff095305fcae98faa0817cbf72f13df9baf76f2067992a8624ef54d18cb',
    ];

    /**
     * Each of the 4 files in mediapipe/wasm/ must match its pinned SHA-256.
     *
     * @return void
     */
    public function test_mediapipe_wasm_files_match_pinned_hashes(): void {
        $dir = \core_component::get_component_directory('local_a11y') . '/mediapipe/wasm';
        foreach (self::EXPECTED_SHA256 as $filename => $expected) {
            $path = $dir . '/' . $filename;
            $this->assertFileExists($path, "Missing bundled MediaPipe WASM file: {$filename}");
            $this->assertSame(
                $expected,
                hash_file('sha256', $path),
                "mediapipe/wasm/{$filename} does not match its pinned SHA-256 - "
                . "was it re-downloaded, partially transferred, or modified?"
            );
        }
    }
}
