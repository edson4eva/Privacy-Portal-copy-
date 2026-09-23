import { GoabButton, GoabCircularProgress, GoabIcon } from '@abgov/react-components';
import { GoabIconType } from '@abgov/ui-components-common';
import { useEffect, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import { serviceAreasPresent } from 'shared/src/lib/service-areas/serviceAreas';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import albertaShield from '../../../assets/alberta-shield-of-arms.svg';
import styles from './AlbertaWalletPage.module.scss';

interface WalletField {
    label: string;
    value: string;
    /** Formatted for display when set; shown verbatim otherwise. */
    isDate?: boolean;
}

interface LicenceDetails {
    number: string;
    class: string;
    dateOfBirth: string;
    sex: string;
    eyes: string;
    hair: string;
    height: string;
    weight: string;
    conditions: string;
    issued: string;
    expires: string;
}

interface WalletDocument {
    id: string;
    documentType: string;
    /** 'licence' draws the printed card; anything else uses the wallet summary. */
    layout?: 'licence';
    licence?: LicenceDetails;
    icon: GoabIconType;
    primaryLabel: string;
    primaryValue: string;
    nameOnCard: string;
    addressLines?: string[];
    fields: WalletField[];
    /**
     * The Alberta.ca topic the document's service is listed under, and the
     * service itself, both from the published services inventory. The same
     * two attributes the access log files an access under, so a reader meets
     * one set of categories across the portal.
     */
    serviceArea?: string;
    listedService?: string;
    /** The service's own website, opened when the card is chosen. */
    serviceUrl?: string;
}

interface Wallet {
    documents: WalletDocument[];
}

/**
 * The cards in each category, in the inventory's order, empty groups dropped.
 *
 * A group names the services its cards are listed under, except where a card
 * already carries that name itself: the Alberta Energy Rebate is both a card
 * and the service it is listed under, and printing it twice, one above the
 * other, tells a reader nothing.
 */
const groupByServiceArea = (
    documents: WalletDocument[]
): { area: string; services: string[]; documents: WalletDocument[] }[] =>
    serviceAreasPresent(documents.map((document) => document.serviceArea)).map((area) => {
        const inArea = documents.filter((document) => document.serviceArea === area);
        const named = new Set(inArea.map((document) => document.documentType.toLowerCase()));
        const services = [...new Set(inArea.map((document) => document.listedService).filter(Boolean))] as string[];

        return {
            area,
            services: services.filter((service) => !named.has(service.toLowerCase())),
            documents: inArea,
        };
    });

/**
 * Documents the inventory does not cover still have to be reachable, so they
 * are grouped together rather than dropped.
 */
const UNFILED = 'Other documents';

const APP_STORE_URL = 'https://apps.apple.com/ca/app/alberta-wallet/id6448763285';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=ca.ab.gov.wallet';

/** Formats an ISO date as "May 10, 1999", the way the wallet card prints it. */
const formatCardDate = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

const StoreBadge = ({
    href,
    icon,
    small,
    large,
}: {
    href: string;
    icon: 'logo-apple' | 'logo-google-playstore';
    small: string;
    large: string;
}): React.ReactElement => (
    <a className={styles['store']} href={href} target="_blank" rel="noopener noreferrer">
        <GoabIcon type={icon} size="large" />
        <span className={styles['store-lines']}>
            <span className={styles['store-small']}>{small}</span>
            <span className={styles['store-large']}>{large}</span>
        </span>
    </a>
);

/** The card prints dates as 12/04/1985. */
const formatSlashDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getUTCFullYear()}`;
};

/** The large birth month and year the card carries for age checks. */
const birthStamp = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const month = date.toLocaleDateString('en-CA', { month: 'short', timeZone: 'UTC' }).toUpperCase();
    return `${month} ${String(date.getUTCFullYear()).slice(-2)}`;
};

/** A placeholder figure, so no likeness is implied. */
const PortraitPlaceholder = (): React.ReactElement => (
    <svg viewBox="0 0 40 52" width="100%" height="100%" aria-hidden focusable="false">
        <circle cx="20" cy="18" r="11" fill="#8ba4b6" />
        <path d="M2 52 C2 36 10 31 20 31 C30 31 38 36 38 52 Z" fill="#8ba4b6" />
    </svg>
);

/** Decorative bars only - deliberately not an encoding of anything. */
const Barcode = (): React.ReactElement => (
    <span className={styles['barcode']} aria-hidden>
        {[
            3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2,
            1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 1, 1, 2, 2,
        ].map((width, index) => (
            <span key={`${index}-${width}`} style={{ width: `${width}px` }} />
        ))}
    </span>
);

/**
 * The card's own element: a link to the service it belongs to, or a plain
 * figure when the service has no website recorded. Choosing a card leaves the
 * portal, so the destination is named for anyone who cannot see the card.
 */
const CardShell = ({
    document,
    className,
    children,
}: {
    document: WalletDocument;
    className: string;
    children: React.ReactNode;
}): React.ReactElement =>
    document.serviceUrl ? (
        <a
            className={className}
            href={document.serviceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`wallet-card-${document.id}`}
            aria-label={`${document.documentType}: open the ${document.listedService ?? document.documentType} service website in a new tab`}
        >
            {children}
        </a>
    ) : (
        <div className={className} data-testid={`wallet-card-${document.id}`}>
            {children}
        </div>
    );

const LicenceCard = ({ document, isFront }: { document: WalletDocument; isFront: boolean }): React.ReactElement => {
    const licence = document.licence;

    return (
        <CardShell document={document} className={`${styles['licence']} ${isFront ? styles['card-front'] : ''}`}>
            <div className={styles['licence-top']}>
                <span className={styles['licence-wordmark']} aria-hidden>
                    Alberta
                    <span className={styles['wordmark-dot']} />
                </span>
                <span className={styles['licence-title']}>{document.documentType}</span>
                <span className={styles['licence-can']}>CAN</span>
            </div>

            <div className={styles['licence-body']}>
                <div>
                    <span className={styles['portrait']}>
                        <PortraitPlaceholder />
                    </span>
                    <span className={styles['signature']} aria-hidden>
                        {document.nameOnCard.split(',').reverse().join(' ').trim().toLowerCase()}
                    </span>
                    <span className={styles['birth-stamp']} data-testid={`birth-stamp-${document.id}`}>
                        {licence ? birthStamp(licence.dateOfBirth) : ''}
                    </span>
                </div>

                <div>
                    <div className={styles['licence-no']}>
                        <span>
                            <span className={styles['licence-label']}>No.</span>{' '}
                            <span className={styles['licence-no-value']} data-testid={`primary-${document.id}`}>
                                {licence?.number ?? document.primaryValue}
                            </span>
                        </span>
                        <span>
                            <span className={styles['licence-label']}>Class</span>{' '}
                            <span className={styles['licence-class-value']}>{licence?.class}</span>
                        </span>
                    </div>

                    <div className={styles['licence-name']} data-testid={`name-${document.id}`}>
                        {document.nameOnCard}
                    </div>
                    {document.addressLines && (
                        <div className={styles['licence-address']} data-testid={`address-${document.id}`}>
                            {document.addressLines.map((line) => (
                                <span className={styles['address-line']} key={line}>
                                    {line}
                                </span>
                            ))}
                        </div>
                    )}

                    {licence && (
                        <>
                            <div className={styles['licence-rows']}>
                                <span>
                                    <span className={styles['licence-label']}>DOB</span>
                                    <span className={styles['licence-field-value']} data-testid={`dob-${document.id}`}>
                                        {formatSlashDate(licence.dateOfBirth)}
                                    </span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Sex</span>
                                    <span className={styles['licence-field-value']}>{licence.sex}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Eyes</span>
                                    <span className={styles['licence-field-value']}>{licence.eyes}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Hair</span>
                                    <span className={styles['licence-field-value']}>{licence.hair}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Height</span>
                                    <span className={styles['licence-field-value']}>{licence.height}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Weight</span>
                                    <span className={styles['licence-field-value']}>{licence.weight}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Cond/End</span>
                                    <span className={styles['licence-field-value']}>{licence.conditions}</span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Iss</span>
                                    <span className={styles['licence-field-value']}>
                                        {formatSlashDate(licence.issued)}
                                    </span>
                                </span>
                                <span>
                                    <span className={styles['licence-label']}>Exp</span>
                                    <span className={styles['licence-field-value']} data-testid={`exp-${document.id}`}>
                                        {formatSlashDate(licence.expires)}
                                    </span>
                                </span>
                            </div>
                            <Barcode />
                        </>
                    )}
                </div>

                <div>
                    <span className={styles['portrait-ghost']}>
                        <PortraitPlaceholder />
                    </span>
                    <span className={styles['qr-frame']} data-testid={`qr-${document.id}`}>
                        <QrPlaceholder seed={document.id} />
                    </span>
                </div>
            </div>

            <span className={styles['specimen']} data-testid={`specimen-${document.id}`}>
                SPECIMEN
            </span>
        </CardShell>
    );
};

/**
 * A QR-shaped mark for a card. The real wallet generates a code at the moment a
 * document is presented; this is a fixed pattern derived from the document id,
 * so each card carries its own and it does not change between renders. It
 * encodes nothing and cannot be scanned.
 */
const QrPlaceholder = ({ seed }: { seed: string }): React.ReactElement => {
    const modules = 21;
    const quiet = 1;
    const size = modules + quiet * 2;

    // Finder patterns sit in three corners, as they do on a real code.
    const inFinder = (x: number, y: number) => {
        const corners = [
            [0, 0],
            [modules - 7, 0],
            [0, modules - 7],
        ];
        return corners.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
    };

    const finderFilled = (x: number, y: number) => {
        const corners = [
            [0, 0],
            [modules - 7, 0],
            [0, modules - 7],
        ];
        const corner = corners.find(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
        if (!corner) {
            return false;
        }

        const dx = x - corner[0];
        const dy = y - corner[1];
        const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        return ring === 3 || ring <= 1;
    };

    let seedHash = 2166136261;
    for (const character of seed) {
        seedHash = (seedHash ^ character.charCodeAt(0)) * 16777619;
        seedHash = seedHash >>> 0;
    }

    /**
     * Mixes the seed with each position. An earlier version only used the seed
     * modulo a small number, so different documents came out with the same
     * pattern.
     */
    const moduleOn = (x: number, y: number): boolean => {
        let h = (seedHash ^ ((x + 1) * 73856093) ^ ((y + 1) * 19349663)) >>> 0;
        h = (h ^ (h >>> 13)) * 1274126177;
        h = h >>> 0;
        return ((h >>> 7) & 0xff) < 118;
    };

    const cells: React.ReactElement[] = [];
    for (let y = 0; y < modules; y++) {
        for (let x = 0; x < modules; x++) {
            const filled = inFinder(x, y) ? finderFilled(x, y) : moduleOn(x, y);

            if (filled) {
                cells.push(<rect key={`${x}-${y}`} x={x + quiet} y={y + quiet} width="1" height="1" />);
            }
        }
    }

    return (
        <svg className={styles['qr']} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Presentation code">
            <rect x="0" y="0" width={size} height={size} fill="#ffffff" />
            <g fill="#1a2733">{cells}</g>
        </svg>
    );
};

const DocumentCard = ({ document, isFront }: { document: WalletDocument; isFront: boolean }): React.ReactElement => (
    <CardShell document={document} className={`${styles['card']} ${isFront ? styles['card-front'] : ''}`}>
        <div className={styles['card-header']}>
            <span className={styles['card-type']}>
                <span className={styles['card-icon']}>
                    <GoabIcon type={document.icon} size="small" />
                </span>
                {document.documentType}
            </span>
            <span className={styles['wordmark']} aria-hidden>
                Alberta
                <span className={styles['wordmark-dot']} />
            </span>
        </div>

        <PpSpacer vSpacing="m" />
        <div className={styles['card-body']}>
            <div className={styles['card-fields']}>
                <div className={styles['field-label']}>{document.primaryLabel}</div>
                <div className={styles['phn']} data-testid={`primary-${document.id}`}>
                    {document.primaryValue}
                </div>

                <PpSpacer vSpacing="s" />
                <div className={styles['field-label']}>Name</div>
                <span className={styles['field-value']} data-testid={`name-${document.id}`}>
                    {document.nameOnCard}
                </span>

                {document.addressLines && (
                    <>
                        <PpSpacer vSpacing="s" />
                        <div className={styles['field-label']}>Address</div>
                        <span className={styles['field-value']} data-testid={`address-${document.id}`}>
                            {document.addressLines.map((line) => (
                                <span className={styles['address-line']} key={line}>
                                    {line}
                                </span>
                            ))}
                        </span>
                    </>
                )}

                <PpSpacer vSpacing="s" />
                <div className={styles['card-grid']}>
                    {document.fields.map((field) => (
                        <div key={field.label}>
                            <div className={styles['field-label']}>{field.label}</div>
                            <span
                                className={styles['field-value']}
                                data-testid={`field-${document.id}-${field.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                            >
                                {field.isDate ? formatCardDate(field.value) : field.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles['card-aside']}>
                <span className={styles['qr-frame']} data-testid={`qr-${document.id}`}>
                    <QrPlaceholder seed={document.id} />
                </span>
                <img
                    className={styles['crest']}
                    src={albertaShield}
                    alt=""
                    aria-hidden
                    data-testid={`crest-${document.id}`}
                />
            </div>
        </div>
    </CardShell>
);

export function AlbertaWalletPage(): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [wallet, setWallet] = useState<Wallet>();
    const [isLoading, setIsLoading] = useState(true);
    const [presentingId, setPresentingId] = useState<string>();
    const [showAddNotice, setShowAddNotice] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ wallet: Wallet }>('/v1/wallet');
                setWallet(response?.wallet);
            } catch (error) {
                // The wallet service is not always reachable. Show the page with
                // no documents rather than failing outright.
                console.error('Failed to fetch wallet documents:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const documents = wallet?.documents ?? [];
    const presenting = documents.find((document) => document.id === presentingId);
    const filed = groupByServiceArea(documents);
    const unfiled = documents.filter((document) => !document.serviceArea);
    const groups = unfiled.length > 0 ? [...filed, { area: UNFILED, services: [], documents: unfiled }] : filed;

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <div className={styles['header']}>
                <h1 className={styles['page-heading']}>Alberta Wallet</h1>
                <GoabButton
                    type="primary"
                    leadingIcon="add"
                    onClick={() => setShowAddNotice(true)}
                    testId="add-to-wallet"
                >
                    Add to Alberta Wallet
                </GoabButton>
            </div>

            {showAddNotice && (
                <>
                    <PpSpacer vSpacing="m" />
                    <p className={styles['empty']} data-testid="add-notice">
                        A document is issued to your wallet through the Alberta Wallet app on your phone, where it is
                        bound to your device. It cannot be added from a browser.
                    </p>
                </>
            )}

            <PpSpacer vSpacing="l" />

            {documents.length === 0 ? (
                <p className={styles['empty']} data-testid="wallet-empty">
                    You have no documents in your Alberta Wallet. Choose Add to Alberta Wallet to add a
                    government-issued digital document.
                </p>
            ) : (
                <>
                    {groups.map((group) => (
                        <section className={styles['area']} key={group.area} data-testid={`area-${group.area}`}>
                            <h2 className={styles['area-heading']}>{group.area}</h2>
                            {group.services.length > 0 && (
                                <p className={styles['area-services']}>{group.services.join(', ')}</p>
                            )}
                            <div className={styles['stack']} data-testid={`wallet-stack-${group.area}`}>
                                {group.documents.map((document) =>
                                    document.layout === 'licence' ? (
                                        <LicenceCard
                                            key={document.id}
                                            document={document}
                                            isFront={presentingId === document.id}
                                        />
                                    ) : (
                                        <DocumentCard
                                            key={document.id}
                                            document={document}
                                            isFront={presentingId === document.id}
                                        />
                                    )
                                )}
                            </div>

                            {/* Choosing a card now opens its service, so presenting has a
                                control of its own. It sits outside the stack, where a card
                                overlapping the one above it cannot cover it. */}
                            <div className={styles['card-actions']}>
                                {group.documents.map((document) => (
                                    <GoabButton
                                        key={document.id}
                                        type="tertiary"
                                        leadingIcon="qr-code"
                                        onClick={() =>
                                            setPresentingId(presentingId === document.id ? undefined : document.id)
                                        }
                                        testId={`present-${document.id}`}
                                    >
                                        {presentingId === document.id
                                            ? `Stop presenting ${document.documentType}`
                                            : `Present ${document.documentType}`}
                                    </GoabButton>
                                ))}
                            </div>
                        </section>
                    ))}
                </>
            )}

            <PpSpacer vSpacing="s" />
            <div className={styles['hint']}>
                <GoabIcon type="information-circle" size="small" />
                Choose a card to open the service it belongs to, or present it to a verifier
            </div>

            {presenting && (
                <>
                    <div className={styles['present']} data-testid="present-panel">
                        <div className={styles['present-code']}>
                            <GoabIcon type="qr-code" size="4" />
                        </div>
                        <PpSpacer vSpacing="s" />
                        <p>
                            Presenting your {presenting.documentType}. A verifier scans this code to confirm the
                            document without seeing the rest of your information.
                        </p>
                        <PpSpacer vSpacing="m" />
                        <GoabButton
                            type="secondary"
                            onClick={() => setPresentingId(undefined)}
                            testId="stop-presenting"
                        >
                            Done
                        </GoabButton>
                    </div>
                    <PpSpacer vSpacing="xl" />
                </>
            )}

            <div className={styles['promo']}>
                <div className={styles['promo-copy']}>
                    <h2 className={styles['promo-heading']}>Get the Alberta Wallet app</h2>
                    <p className={styles['promo-text']}>
                        Download the Alberta Wallet app to securely access your government-issued digital documents
                        anytime, anywhere.
                    </p>
                    <div className={styles['stores']}>
                        <StoreBadge href={APP_STORE_URL} icon="logo-apple" small="Download on the" large="App Store" />
                        <StoreBadge
                            href={GOOGLE_PLAY_URL}
                            icon="logo-google-playstore"
                            small="Get it on"
                            large="Google Play"
                        />
                    </div>
                </div>
            </div>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default AlbertaWalletPage;
