// Contract Studio — built-in templates
// Each template is Arc-compatible and includes safety comments

export interface ContractTemplate {
  id:       string
  name:     string
  category: string
  description: string
  source:   string
}

export const TEMPLATES: ContractTemplate[] = [
  {
    id:       'erc20-basic',
    name:     'ERC20 Token',
    category: 'Tokens',
    description: 'Standard ERC20 with mint, burn, and pause. Arc-compatible.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcToken
 * @notice Arc-compatible ERC20 token.
 *
 * Arc notes:
 * - Gas is paid in USDC (not ETH). msg.value uses 18-decimal native USDC.
 * - PREVRANDAO always returns 0 on Arc — do not use for randomness.
 * - Transfers to address(0) with value will REVERT.
 * - USDC.balanceOf uses 6 decimals; addr.balance uses 18 — never mix them.
 */
contract ArcToken is ERC20, ERC20Burnable, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _decimals = decimals_;
        _mint(owner_, initialSupply * 10 ** decimals_);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
`,
  },

  {
    id:       'erc721-basic',
    name:     'ERC721 NFT',
    category: 'NFTs',
    description: 'ERC721 collection with URI storage and enumerable.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArcNFT
 * @notice ERC721 collection optimized for Arc.
 *
 * Arc notes:
 * - All value transfers use USDC (native asset). msg.value = USDC amount.
 * - Never transfer to address(0) — will REVERT with "Zero address not allowed".
 * - For randomness in minting, use an oracle (PREVRANDAO = 0 on Arc).
 */
contract ArcNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintPrice;   // In native USDC (18 decimals)
    uint256 public maxSupply;

    error MaxSupplyReached();
    error InsufficientPayment();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 mintPrice_,
        uint256 maxSupply_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        mintPrice  = mintPrice_;
        maxSupply  = maxSupply_;
    }

    function mint(address to, string calldata tokenURI_) external payable {
        if (_nextTokenId >= maxSupply) revert MaxSupplyReached();
        if (msg.value < mintPrice)     revert InsufficientPayment();

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() external onlyOwner {
        // Note: on Arc this sends native USDC to owner
        payable(owner()).transfer(address(this).balance);
    }
}
`,
  },

  {
    id:       'erc1155-basic',
    name:     'ERC1155 Multi-token',
    category: 'NFTs',
    description: 'ERC1155 for batch operations and multiple token types.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArcMultiToken — ERC1155 for Arc
contract ArcMultiToken is ERC1155, Ownable {
    mapping(uint256 => uint256) public totalSupply;

    constructor(string memory uri_, address owner_)
        ERC1155(uri_) Ownable(owner_) {}

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyOwner {
        totalSupply[id] += amount;
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            totalSupply[ids[i]] += amounts[i];
        }
        _mintBatch(to, ids, amounts, data);
    }

    function setURI(string calldata newURI) external onlyOwner {
        _setURI(newURI);
    }
}
`,
  },

  {
    id:       'arc-agent',
    name:     'AI Agent Registry (ERC-8004)',
    category: 'Arc Native',
    description: 'Register an AI agent with onchain identity and reputation.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcAgentIdentity
 * @notice ERC-8004 compatible AI agent identity contract.
 *
 * ERC-8004 is an Arc-native standard for onchain AI agent identity.
 * Agents can register identity, build reputation, and verify credentials.
 *
 * Arc notes:
 * - This contract is Arc-specific (ERC-8004 is not on other chains).
 * - Gas paid in USDC. Registration costs ~$0.01 USDC.
 */
contract ArcAgentIdentity {
    struct Agent {
        address owner;
        string  name;
        string  description;
        string  metadataURI;     // IPFS or HTTPS metadata
        uint256 reputationScore;
        uint256 registeredAt;
        bool    verified;
    }

    mapping(bytes32 => Agent) public agents;
    mapping(address => bytes32[]) public ownerAgents;

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, string name);
    event ReputationUpdated(bytes32 indexed agentId, uint256 newScore);

    error AgentAlreadyExists();
    error NotAgentOwner();
    error AgentNotFound();

    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata metadataURI
    ) external returns (bytes32 agentId) {
        agentId = keccak256(abi.encodePacked(msg.sender, name, block.number));

        if (agents[agentId].registeredAt != 0) revert AgentAlreadyExists();

        agents[agentId] = Agent({
            owner:           msg.sender,
            name:            name,
            description:     description,
            metadataURI:     metadataURI,
            reputationScore: 0,
            registeredAt:    block.timestamp,
            verified:        false
        });

        ownerAgents[msg.sender].push(agentId);
        emit AgentRegistered(agentId, msg.sender, name);
    }

    function getAgent(bytes32 agentId) external view returns (Agent memory) {
        if (agents[agentId].registeredAt == 0) revert AgentNotFound();
        return agents[agentId];
    }

    function getOwnerAgents(address owner) external view returns (bytes32[] memory) {
        return ownerAgents[owner];
    }
}
`,
  },

  {
    id:       'arc-job',
    name:     'AI Job Contract (ERC-8183)',
    category: 'Arc Native',
    description: 'Full ERC-8183 job lifecycle with USDC escrow and settlement.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcJob
 * @notice ERC-8183 job contract with USDC escrow.
 *
 * Job lifecycle: Created → Funded → Active → Submitted → Completed | Disputed
 *
 * Arc notes:
 * - Escrow is in native USDC (18 decimal msg.value).
 * - Settlement is instant thanks to Arc's sub-second finality.
 * - SELFDESTRUCT to zero address reverts — never use for fund recovery.
 */
contract ArcJob {
    enum Status { Open, Active, Submitted, Completed, Disputed, Cancelled }

    struct Job {
        address client;
        address worker;
        string  title;
        string  description;
        bytes32 deliverablesHash;   // keccak256 of deliverables spec
        uint256 escrowAmount;       // native USDC (18 decimals)
        uint256 deadline;
        Status  status;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId;

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 escrow);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event JobSubmitted(uint256 indexed jobId);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payment);

    error InsufficientEscrow();
    error JobNotFound();
    error Unauthorized();
    error InvalidStatus();
    error DeadlinePassed();

    /// @notice Create a job and fund the escrow with native USDC
    function createJob(
        string calldata title,
        string calldata description,
        bytes32 deliverablesHash,
        uint256 deadline
    ) external payable returns (uint256 jobId) {
        if (msg.value == 0) revert InsufficientEscrow();

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client:          msg.sender,
            worker:          address(0),
            title:           title,
            description:     description,
            deliverablesHash: deliverablesHash,
            escrowAmount:    msg.value,
            deadline:        deadline,
            status:          Status.Open
        });

        emit JobCreated(jobId, msg.sender, msg.value);
    }

    /// @notice Worker accepts the job
    function acceptJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (job.client == address(0))  revert JobNotFound();
        if (job.status != Status.Open) revert InvalidStatus();
        if (block.timestamp > job.deadline) revert DeadlinePassed();

        job.worker = msg.sender;
        job.status = Status.Active;
        emit JobAccepted(jobId, msg.sender);
    }

    /// @notice Client releases payment to worker
    function completeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client) revert Unauthorized();
        if (job.status != Status.Submitted) revert InvalidStatus();

        uint256 payment = job.escrowAmount;
        job.status      = Status.Completed;
        job.escrowAmount = 0;

        // Transfer native USDC to worker
        payable(job.worker).transfer(payment);
        emit JobCompleted(jobId, job.worker, payment);
    }
}
`,
  },
]

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]))

export const DEFAULT_SOURCE = TEMPLATES[0].source
