---
title: "블록체인과 스마트 컨트랙트 기반 DeFi 서비스 구현"
description: "이더리움과 솔라나를 활용한 탈중앙화 금융 서비스 개발과 카카오페이의 블록체인 기술 적용 사례를 소개합니다."
publishedAt: "2024-12-24"
category: "Tech"
tags: ["블록체인", "스마트컨트랙트", "DeFi", "이더리움", "솔라나"]
author: "김블록체인"
featured: false
---

# 블록체인과 스마트 컨트랙트 기반 DeFi 서비스 구현

블록체인 기술과 스마트 컨트랙트는 금융 서비스의 패러다임을 바꾸고 있습니다. 카카오페이에서 블록체인 기반 결제 시스템과 DeFi 프로토콜을 연구 개발하며 얻은 경험을 바탕으로, 실무에서 적용 가능한 구현 방법을 상세히 설명합니다.

## 이더리움 스마트 컨트랙트 개발

### 1. ERC-20 토큰 컨트랙트
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KakaoPayToken
 * @dev ERC20 토큰 컨트랙트 with 추가 기능들
 */
contract KakaoPayToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // 상태 변수
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public dailyTransferLimits;
    mapping(address => uint256) public dailyTransferAmounts;
    mapping(address => uint256) public lastTransferDate;
    
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 10억 토큰
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 1억 토큰
    
    // 이벤트
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event DailyLimitUpdated(address indexed account, uint256 limit);
    event ComplianceTransfer(address indexed from, address indexed to, uint256 amount);
    
    // 수정자 (Modifiers)
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    modifier withinDailyLimit(address account, uint256 amount) {
        uint256 today = block.timestamp / 1 days;
        
        if (lastTransferDate[account] != today) {
            dailyTransferAmounts[account] = 0;
            lastTransferDate[account] = today;
        }
        
        require(
            dailyTransferAmounts[account] + amount <= dailyTransferLimits[account],
            "Daily transfer limit exceeded"
        );
        
        dailyTransferAmounts[account] += amount;
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
        
        // 기본 일일 전송 한도 설정 (10만 토큰)
        dailyTransferLimits[initialOwner] = 100000 * 10**18;
    }
    
    /**
     * @dev 토큰 추가 발행 (최대 공급량 한도 내에서)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev 블랙리스트 관리
     */
    function updateBlacklist(address account, bool _blacklisted) public onlyOwner {
        blacklisted[account] = _blacklisted;
        emit BlacklistUpdated(account, _blacklisted);
    }
    
    /**
     * @dev 일일 전송 한도 설정
     */
    function setDailyTransferLimit(address account, uint256 limit) public onlyOwner {
        dailyTransferLimits[account] = limit;
        emit DailyLimitUpdated(account, limit);
    }
    
    /**
     * @dev 긴급 상황 시 토큰 회수
     */
    function emergencyWithdraw(address from, uint256 amount) public onlyOwner {
        require(blacklisted[from], "Account must be blacklisted first");
        _transfer(from, owner(), amount);
    }
    
    /**
     * @dev 컨트랙트 일시 정지/재개
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 전송 함수 오버라이드 - 추가 검증 로직 포함
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        notBlacklisted(msg.sender) 
        notBlacklisted(to)
        withinDailyLimit(msg.sender, amount)
        nonReentrant
        returns (bool) 
    {
        bool result = super.transfer(to, amount);
        emit ComplianceTransfer(msg.sender, to, amount);
        return result;
    }
    
    function transferFrom(address from, address to, uint256 amount)
        public
        override
        notBlacklisted(from)
        notBlacklisted(to)
        withinDailyLimit(from, amount)
        nonReentrant
        returns (bool)
    {
        bool result = super.transferFrom(from, to, amount);
        emit ComplianceTransfer(from, to, amount);
        return result;
    }
    
    /**
     * @dev 배치 전송 - 가스 효율성 향상
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        notBlacklisted(msg.sender)
        nonReentrant 
    {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        // 일일 한도 검증
        uint256 today = block.timestamp / 1 days;
        if (lastTransferDate[msg.sender] != today) {
            dailyTransferAmounts[msg.sender] = 0;
            lastTransferDate[msg.sender] = today;
        }
        
        require(
            dailyTransferAmounts[msg.sender] + totalAmount <= dailyTransferLimits[msg.sender],
            "Daily transfer limit exceeded"
        );
        
        dailyTransferAmounts[msg.sender] += totalAmount;
        
        // 배치 전송 실행
        for (uint256 i = 0; i < recipients.length; i++) {
            require(!blacklisted[recipients[i]], "Recipient is blacklisted");
            _transfer(msg.sender, recipients[i], amounts[i]);
            emit ComplianceTransfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    // OpenZeppelin 함수 오버라이드
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
```

### 2. DeFi 스테이킹 컨트랙트
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title StakingPool
 * @dev 토큰 스테이킹 풀 컨트랙트
 */
contract StakingPool is ReentrancyGuard, Ownable {
    using Math for uint256;
    
    // 구조체
    struct StakeInfo {
        uint256 amount;           // 스테이킹 금액
        uint256 rewardDebt;       // 보상 부채
        uint256 lastStakeTime;    // 마지막 스테이킹 시간
        uint256 lockEndTime;      // 락업 종료 시간
    }
    
    struct PoolInfo {
        IERC20 stakingToken;      // 스테이킹 토큰
        IERC20 rewardToken;       // 보상 토큰
        uint256 totalStaked;      // 총 스테이킹 량
        uint256 rewardPerSecond;  // 초당 보상
        uint256 accRewardPerShare; // 누적 보상 per share
        uint256 lastRewardTime;   // 마지막 보상 시간
        uint256 lockPeriod;       // 락업 기간 (초)
        uint256 earlyWithdrawFee; // 조기 출금 수수료 (basis points)
    }
    
    // 상태 변수
    PoolInfo public poolInfo;
    mapping(address => StakeInfo) public stakeInfo;
    uint256 private constant PRECISION = 1e18;
    uint256 private constant MAX_FEE = 1000; // 10%
    
    // 이벤트
    event Stake(address indexed user, uint256 amount);
    event Unstake(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event PoolUpdated(uint256 rewardPerSecond, uint256 lockPeriod);
    
    constructor(
        IERC20 _stakingToken,
        IERC20 _rewardToken,
        uint256 _rewardPerSecond,
        uint256 _lockPeriod,
        uint256 _earlyWithdrawFee
    ) Ownable(msg.sender) {
        require(_earlyWithdrawFee <= MAX_FEE, "Fee too high");
        
        poolInfo = PoolInfo({
            stakingToken: _stakingToken,
            rewardToken: _rewardToken,
            totalStaked: 0,
            rewardPerSecond: _rewardPerSecond,
            accRewardPerShare: 0,
            lastRewardTime: block.timestamp,
            lockPeriod: _lockPeriod,
            earlyWithdrawFee: _earlyWithdrawFee
        });
    }
    
    /**
     * @dev 풀 정보 업데이트
     */
    function updatePool() public {
        if (block.timestamp <= poolInfo.lastRewardTime) {
            return;
        }
        
        if (poolInfo.totalStaked == 0) {
            poolInfo.lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - poolInfo.lastRewardTime;
        uint256 reward = timeElapsed * poolInfo.rewardPerSecond;
        
        poolInfo.accRewardPerShare += (reward * PRECISION) / poolInfo.totalStaked;
        poolInfo.lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev 스테이킹 함수
     */
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        
        updatePool();
        
        StakeInfo storage user = stakeInfo[msg.sender];
        
        // 기존 보상 지급
        if (user.amount > 0) {
            uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                safeRewardTransfer(msg.sender, pending);
                emit RewardClaimed(msg.sender, pending);
            }
        }
        
        // 스테이킹 토큰 전송
        poolInfo.stakingToken.transferFrom(msg.sender, address(this), _amount);
        
        // 사용자 정보 업데이트
        user.amount += _amount;
        user.lastStakeTime = block.timestamp;
        user.lockEndTime = block.timestamp + poolInfo.lockPeriod;
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        
        // 풀 정보 업데이트
        poolInfo.totalStaked += _amount;
        
        emit Stake(msg.sender, _amount);
    }
    
    /**
     * @dev 언스테이킹 함수
     */
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage user = stakeInfo[msg.sender];
        require(user.amount >= _amount, "Insufficient staked amount");
        
        updatePool();
        
        // 보상 계산 및 지급
        uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
        if (pending > 0) {
            safeRewardTransfer(msg.sender, pending);
            emit RewardClaimed(msg.sender, pending);
        }
        
        // 조기 출금 수수료 계산
        uint256 withdrawAmount = _amount;
        if (block.timestamp < user.lockEndTime) {
            uint256 fee = (_amount * poolInfo.earlyWithdrawFee) / 10000;
            withdrawAmount = _amount - fee;
            
            // 수수료는 컨트랙트에 보관 (재투자 목적)
            if (fee > 0) {
                poolInfo.stakingToken.transfer(owner(), fee);
            }
        }
        
        // 사용자 정보 업데이트
        user.amount -= _amount;
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        
        // 풀 정보 업데이트
        poolInfo.totalStaked -= _amount;
        
        // 토큰 전송
        poolInfo.stakingToken.transfer(msg.sender, withdrawAmount);
        
        emit Unstake(msg.sender, _amount);
    }
    
    /**
     * @dev 보상만 청구
     */
    function claimReward() external nonReentrant {
        updatePool();
        
        StakeInfo storage user = stakeInfo[msg.sender];
        uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
        
        require(pending > 0, "No pending rewards");
        
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        safeRewardTransfer(msg.sender, pending);
        
        emit RewardClaimed(msg.sender, pending);
    }
    
    /**
     * @dev 긴급 출금 (보상 포기하고 원금만 회수)
     */
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage user = stakeInfo[msg.sender];
        uint256 amount = user.amount;
        
        require(amount > 0, "Nothing to withdraw");
        
        // 상태 초기화
        user.amount = 0;
        user.rewardDebt = 0;
        user.lastStakeTime = 0;
        user.lockEndTime = 0;
        
        // 풀 정보 업데이트
        poolInfo.totalStaked -= amount;
        
        // 조기 출금 수수료 적용 (락업 기간 내인 경우)
        uint256 withdrawAmount = amount;
        if (block.timestamp < user.lockEndTime) {
            uint256 fee = (amount * poolInfo.earlyWithdrawFee) / 10000;
            withdrawAmount = amount - fee;
        }
        
        poolInfo.stakingToken.transfer(msg.sender, withdrawAmount);
        
        emit EmergencyWithdraw(msg.sender, withdrawAmount);
    }
    
    /**
     * @dev 안전한 보상 토큰 전송
     */
    function safeRewardTransfer(address _to, uint256 _amount) internal {
        uint256 rewardBal = poolInfo.rewardToken.balanceOf(address(this));
        uint256 transferAmount = _amount > rewardBal ? rewardBal : _amount;
        poolInfo.rewardToken.transfer(_to, transferAmount);
    }
    
    /**
     * @dev 사용자의 대기 중인 보상 조회
     */
    function pendingReward(address _user) external view returns (uint256) {
        StakeInfo memory user = stakeInfo[_user];
        uint256 accRewardPerShare = poolInfo.accRewardPerShare;
        
        if (block.timestamp > poolInfo.lastRewardTime && poolInfo.totalStaked != 0) {
            uint256 timeElapsed = block.timestamp - poolInfo.lastRewardTime;
            uint256 reward = timeElapsed * poolInfo.rewardPerSecond;
            accRewardPerShare += (reward * PRECISION) / poolInfo.totalStaked;
        }
        
        return (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;
    }
    
    /**
     * @dev 관리자 함수들
     */
    function updateRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
        updatePool();
        poolInfo.rewardPerSecond = _rewardPerSecond;
        emit PoolUpdated(_rewardPerSecond, poolInfo.lockPeriod);
    }
    
    function updateLockPeriod(uint256 _lockPeriod) external onlyOwner {
        poolInfo.lockPeriod = _lockPeriod;
        emit PoolUpdated(poolInfo.rewardPerSecond, _lockPeriod);
    }
    
    function withdrawRewardTokens(uint256 _amount) external onlyOwner {
        poolInfo.rewardToken.transfer(owner(), _amount);
    }
}
```

## 솔라나 프로그램 개발

### 1. Rust로 작성된 솔라나 프로그램
```rust
// lib.rs - 솔라나 프로그램 메인
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YourProgramIDHere");

#[program]
pub mod kakaopay_defi {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        reward_per_slot: u64,
        lock_period: i64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.stake_mint = ctx.accounts.stake_mint.key();
        pool.reward_mint = ctx.accounts.reward_mint.key();
        pool.reward_per_slot = reward_per_slot;
        pool.lock_period = lock_period;
        pool.total_staked = 0;
        pool.last_reward_slot = Clock::get()?.slot;
        pool.acc_reward_per_share = 0;
        pool.bump = *ctx.bumps.get("pool").unwrap();

        msg!("Pool initialized with reward_per_slot: {}", reward_per_slot);
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let pool = &mut ctx.accounts.pool;
        let user_info = &mut ctx.accounts.user_info;
        
        // 풀 업데이트
        update_pool(pool)?;

        // 기존 보상 계산
        if user_info.amount > 0 {
            let pending_reward = ((user_info.amount as u128)
                .checked_mul(pool.acc_reward_per_share as u128)
                .unwrap()
                / PRECISION as u128) as u64
                - user_info.reward_debt;

            if pending_reward > 0 {
                // 보상 지급 로직
                transfer_reward_tokens(
                    ctx.accounts.pool_reward_vault.to_account_info(),
                    ctx.accounts.user_reward_account.to_account_info(),
                    ctx.accounts.pool.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    pending_reward,
                    pool.bump,
                )?;
            }
        }

        // 스테이킹 토큰 전송
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_stake_account.to_account_info(),
                    to: ctx.accounts.pool_stake_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // 사용자 정보 업데이트
        user_info.amount = user_info.amount.checked_add(amount).unwrap();
        user_info.reward_debt = ((user_info.amount as u128)
            .checked_mul(pool.acc_reward_per_share as u128)
            .unwrap()
            / PRECISION as u128) as u64;
        user_info.last_stake_slot = Clock::get()?.slot;
        user_info.lock_end_slot = Clock::get()?.slot + (pool.lock_period as u64);

        // 풀 정보 업데이트
        pool.total_staked = pool.total_staked.checked_add(amount).unwrap();

        msg!("Staked {} tokens", amount);
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_info = &mut ctx.accounts.user_info;
        
        require!(user_info.amount >= amount, ErrorCode::InsufficientStake);
        
        // 풀 업데이트
        update_pool(pool)?;

        // 보상 계산 및 지급
        let pending_reward = ((user_info.amount as u128)
            .checked_mul(pool.acc_reward_per_share as u128)
            .unwrap()
            / PRECISION as u128) as u64
            - user_info.reward_debt;

        if pending_reward > 0 {
            transfer_reward_tokens(
                ctx.accounts.pool_reward_vault.to_account_info(),
                ctx.accounts.user_reward_account.to_account_info(),
                ctx.accounts.pool.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                pending_reward,
                pool.bump,
            )?;
        }

        // 조기 출금 수수료 계산
        let current_slot = Clock::get()?.slot;
        let mut withdraw_amount = amount;
        
        if current_slot < user_info.lock_end_slot {
            let early_withdraw_fee = amount.checked_mul(EARLY_WITHDRAW_FEE_BPS as u64)
                .unwrap()
                .checked_div(10000)
                .unwrap();
            withdraw_amount = amount.checked_sub(early_withdraw_fee).unwrap();
        }

        // 토큰 전송
        transfer_stake_tokens(
            ctx.accounts.pool_stake_vault.to_account_info(),
            ctx.accounts.user_stake_account.to_account_info(),
            ctx.accounts.pool.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            withdraw_amount,
            pool.bump,
        )?;

        // 사용자 정보 업데이트
        user_info.amount = user_info.amount.checked_sub(amount).unwrap();
        user_info.reward_debt = ((user_info.amount as u128)
            .checked_mul(pool.acc_reward_per_share as u128)
            .unwrap()
            / PRECISION as u128) as u64;

        // 풀 정보 업데이트
        pool.total_staked = pool.total_staked.checked_sub(amount).unwrap();

        msg!("Unstaked {} tokens", amount);
        Ok(())
    }
}

// 상수 정의
const PRECISION: u64 = 1_000_000_000_000; // 1e12
const EARLY_WITHDRAW_FEE_BPS: u16 = 500; // 5%

// 상태 구조체
#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub stake_mint: Pubkey,
    pub reward_mint: Pubkey,
    pub reward_per_slot: u64,
    pub lock_period: i64,
    pub total_staked: u64,
    pub last_reward_slot: u64,
    pub acc_reward_per_share: u64,
    pub bump: u8,
}

#[account]
pub struct UserInfo {
    pub user: Pubkey,
    pub amount: u64,
    pub reward_debt: u64,
    pub last_stake_slot: u64,
    pub lock_end_slot: u64,
}

// Context 구조체들
#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<Pool>(),
        seeds = [b"pool", stake_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    pub stake_mint: Account<'info, token::Mint>,
    pub reward_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = stake_mint,
        token::authority = pool,
    )]
    pub pool_stake_vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = reward_mint,
        token::authority = pool,
    )]
    pub pool_reward_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"pool", pool.stake_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + std::mem::size_of::<UserInfo>(),
        seeds = [b"user_info", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_info: Account<'info, UserInfo>,
    
    #[account(
        mut,
        constraint = user_stake_account.mint == pool.stake_mint
    )]
    pub user_stake_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_reward_account.mint == pool.reward_mint
    )]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_stake_vault.mint == pool.stake_mint
    )]
    pub pool_stake_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_reward_vault.mint == pool.reward_mint
    )]
    pub pool_reward_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// 유틸리티 함수들
fn update_pool(pool: &mut Pool) -> Result<()> {
    let current_slot = Clock::get()?.slot;
    
    if current_slot <= pool.last_reward_slot {
        return Ok(());
    }
    
    if pool.total_staked == 0 {
        pool.last_reward_slot = current_slot;
        return Ok(());
    }
    
    let slots_elapsed = current_slot - pool.last_reward_slot;
    let reward = slots_elapsed.checked_mul(pool.reward_per_slot).unwrap();
    
    pool.acc_reward_per_share = pool.acc_reward_per_share
        .checked_add(
            (reward as u128)
                .checked_mul(PRECISION as u128)
                .unwrap()
                .checked_div(pool.total_staked as u128)
                .unwrap() as u64
        )
        .unwrap();
        
    pool.last_reward_slot = current_slot;
    
    Ok(())
}

fn transfer_reward_tokens<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    amount: u64,
    bump: u8,
) -> Result<()> {
    let seeds = &[b"pool".as_ref(), &[bump]];
    let signer_seeds = &[&seeds[..]];
    
    token::transfer(
        CpiContext::new_with_signer(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
            signer_seeds,
        ),
        amount,
    )?;
    
    Ok(())
}

// 에러 정의
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
}
```

### 2. TypeScript SDK 구현
```typescript
// sdk/index.ts - 클라이언트 SDK
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  Wallet,
  BN,
} from '@project-serum/anchor';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMint,
  mintTo,
} from '@solana/spl-token';

export class KakaoPayDeFiSDK {
  private connection: Connection;
  private program: Program;
  private wallet: Wallet;

  constructor(
    connection: Connection,
    program: Program,
    wallet: Wallet
  ) {
    this.connection = connection;
    this.program = program;
    this.wallet = wallet;
  }

  /**
   * 스테이킹 풀 초기화
   */
  async initializePool(
    stakeMint: PublicKey,
    rewardMint: PublicKey,
    rewardPerSlot: BN,
    lockPeriod: BN
  ): Promise<{ pool: PublicKey; tx: string }> {
    const [poolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), stakeMint.toBuffer()],
      this.program.programId
    );

    const poolStakeVault = await getAssociatedTokenAddress(
      stakeMint,
      poolPDA,
      true
    );

    const poolRewardVault = await getAssociatedTokenAddress(
      rewardMint,
      poolPDA,
      true
    );

    const tx = await this.program.methods
      .initializePool(rewardPerSlot, lockPeriod)
      .accounts({
        authority: this.wallet.publicKey,
        pool: poolPDA,
        stakeMint,
        rewardMint,
        poolStakeVault,
        poolRewardVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return { pool: poolPDA, tx };
  }

  /**
   * 토큰 스테이킹
   */
  async stake(
    poolAddress: PublicKey,
    amount: BN
  ): Promise<string> {
    const poolAccount = await this.program.account.pool.fetch(poolAddress);
    
    const [userInfoPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_info'),
        poolAddress.toBuffer(),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const userStakeAccount = await getAssociatedTokenAddress(
      poolAccount.stakeMint,
      this.wallet.publicKey
    );

    const userRewardAccount = await getAssociatedTokenAddress(
      poolAccount.rewardMint,
      this.wallet.publicKey
    );

    const poolStakeVault = await getAssociatedTokenAddress(
      poolAccount.stakeMint,
      poolAddress,
      true
    );

    const poolRewardVault = await getAssociatedTokenAddress(
      poolAccount.rewardMint,
      poolAddress,
      true
    );

    // Associated Token Account가 존재하지 않으면 생성
    const instructions = [];
    const userRewardAccountInfo = await this.connection.getAccountInfo(userRewardAccount);
    if (!userRewardAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey,
          userRewardAccount,
          this.wallet.publicKey,
          poolAccount.rewardMint
        )
      );
    }

    const tx = await this.program.methods
      .stake(amount)
      .accounts({
        user: this.wallet.publicKey,
        pool: poolAddress,
        userInfo: userInfoPDA,
        userStakeAccount,
        userRewardAccount,
        poolStakeVault,
        poolRewardVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .preInstructions(instructions)
      .rpc();

    return tx;
  }

  /**
   * 토큰 언스테이킹
   */
  async unstake(
    poolAddress: PublicKey,
    amount: BN
  ): Promise<string> {
    const poolAccount = await this.program.account.pool.fetch(poolAddress);
    
    const [userInfoPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_info'),
        poolAddress.toBuffer(),
        this.wallet.publicKey.toBuffer(),
      ],
      this.program.programId
    );

    const userStakeAccount = await getAssociatedTokenAddress(
      poolAccount.stakeMint,
      this.wallet.publicKey
    );

    const userRewardAccount = await getAssociatedTokenAddress(
      poolAccount.rewardMint,
      this.wallet.publicKey
    );

    const poolStakeVault = await getAssociatedTokenAddress(
      poolAccount.stakeMint,
      poolAddress,
      true
    );

    const poolRewardVault = await getAssociatedTokenAddress(
      poolAccount.rewardMint,
      poolAddress,
      true
    );

    const tx = await this.program.methods
      .unstake(amount)
      .accounts({
        user: this.wallet.publicKey,
        pool: poolAddress,
        userInfo: userInfoPDA,
        userStakeAccount,
        userRewardAccount,
        poolStakeVault,
        poolRewardVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * 사용자 스테이킹 정보 조회
   */
  async getUserInfo(
    poolAddress: PublicKey,
    userAddress?: PublicKey
  ): Promise<any> {
    const user = userAddress || this.wallet.publicKey;
    
    const [userInfoPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_info'),
        poolAddress.toBuffer(),
        user.toBuffer(),
      ],
      this.program.programId
    );

    try {
      const userInfo = await this.program.account.userInfo.fetch(userInfoPDA);
      return userInfo;
    } catch (error) {
      // 사용자 정보가 없으면 null 반환
      return null;
    }
  }

  /**
   * 풀 정보 조회
   */
  async getPoolInfo(poolAddress: PublicKey): Promise<any> {
    return await this.program.account.pool.fetch(poolAddress);
  }

  /**
   * 대기 중인 보상 계산
   */
  async calculatePendingReward(
    poolAddress: PublicKey,
    userAddress?: PublicKey
  ): Promise<BN> {
    const user = userAddress || this.wallet.publicKey;
    const poolInfo = await this.getPoolInfo(poolAddress);
    const userInfo = await this.getUserInfo(poolAddress, user);

    if (!userInfo || userInfo.amount.eq(new BN(0))) {
      return new BN(0);
    }

    // 현재 슬롯 조회
    const currentSlot = await this.connection.getSlot();
    
    // 누적 보상 계산
    let accRewardPerShare = poolInfo.accRewardPerShare;
    
    if (currentSlot > poolInfo.lastRewardSlot && !poolInfo.totalStaked.eq(new BN(0))) {
      const slotsElapsed = new BN(currentSlot - poolInfo.lastRewardSlot.toNumber());
      const reward = slotsElapsed.mul(poolInfo.rewardPerSlot);
      
      accRewardPerShare = accRewardPerShare.add(
        reward.mul(new BN(1e12)).div(poolInfo.totalStaked)
      );
    }

    // 대기 중인 보상 계산
    const pendingReward = userInfo.amount
      .mul(accRewardPerShare)
      .div(new BN(1e12))
      .sub(userInfo.rewardDebt);

    return pendingReward;
  }

  /**
   * 유틸리티: 풀 주소 계산
   */
  static findPoolAddress(
    stakeMint: PublicKey,
    programId: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), stakeMint.toBuffer()],
      programId
    );
  }

  /**
   * 유틸리티: 사용자 정보 주소 계산
   */
  static findUserInfoAddress(
    poolAddress: PublicKey,
    userAddress: PublicKey,
    programId: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_info'),
        poolAddress.toBuffer(),
        userAddress.toBuffer(),
      ],
      programId
    );
  }
}

// 사용 예제
export async function example() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = new Wallet(Keypair.generate());
  
  // Program 객체는 실제 환경에서는 IDL과 프로그램 ID로 생성
  const program = {} as Program; // 실제 구현에서는 적절히 초기화
  
  const sdk = new KakaoPayDeFiSDK(connection, program, wallet);
  
  // 스테이킹 풀 초기화
  const stakeMint = new PublicKey('...'); // 실제 mint 주소
  const rewardMint = new PublicKey('...'); // 실제 mint 주소
  
  const { pool } = await sdk.initializePool(
    stakeMint,
    rewardMint,
    new BN(1000), // 슬롯당 1000 토큰 보상
    new BN(432000) // 약 2일 락업 (슬롯 기준)
  );
  
  // 토큰 스테이킹
  await sdk.stake(pool, new BN(1000000)); // 1백만 토큰 스테이킹
  
  // 보상 확인
  const pendingReward = await sdk.calculatePendingReward(pool);
  console.log('Pending reward:', pendingReward.toString());
}
```

블록체인과 스마트 컨트랙트 기술은 금융 서비스의 투명성과 탈중앙화를 가능하게 합니다. 이더리움의 성숙한 생태계와 솔라나의 높은 성능을 적절히 활용하여, 사용자에게 안전하고 효율적인 DeFi 서비스를 제공할 수 있습니다.