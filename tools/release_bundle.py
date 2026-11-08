"""Prepare, never upload, the explicit public assets from the reviewed tree."""
from pathlib import Path
import argparse
import hashlib
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = (
    'index.html', 'sw.js', 'manifest.webmanifest', 'THIRD_PARTY_NOTICES.md',
    'assets/icon-180.png', 'assets/icon-512.png',
    'vendor/workbuddy-cloud-sdk.js', 'vendor/LICENSE-workbuddy-cloud-sdk.txt',
    'vendor/LICENSE-ts-fsrs.txt',
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    destination = args.output.resolve()
    if ROOT == destination or ROOT in destination.parents:
        parser.error('Write the release ZIP outside the source checkout.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    checksums = []
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in PUBLIC:
            data = ROOT.joinpath(name).read_bytes()
            info = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
            checksums.append(f'{hashlib.sha256(data).hexdigest()}  {name}')
        info = zipfile.ZipInfo('SHA256SUMS.txt', (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, '\n'.join(checksums) + '\n')
    print(destination)
    print('SHA256', hashlib.sha256(destination.read_bytes()).hexdigest())


if __name__ == '__main__':
    main()
