package com.permission.web.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.dal.dataobject.PositionDO;
import com.permission.dal.mapper.PositionMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "岗位管理")
@RestController
@RequestMapping("/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionMapper positionMapper;

    @Operation(summary = "查询所有岗位")
    @GetMapping
    @RequirePermission("USER_CENTER_POSITION_VIEW")
    public ApiResponse<List<PositionDO>> listAll() {
        LambdaQueryWrapper<PositionDO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PositionDO::getDeleted, 0).orderByAsc(PositionDO::getLevel);
        return ApiResponse.success(positionMapper.selectList(wrapper));
    }

    @Operation(summary = "创建岗位")
    @PostMapping
    @RequirePermission("USER_CENTER_POSITION_CREATE")
    public ApiResponse<PositionDO> create(@RequestBody PositionDO position) {
        position.setGmtCreate(LocalDateTime.now());
        position.setGmtModified(LocalDateTime.now());
        position.setDeleted(0);
        positionMapper.insert(position);
        return ApiResponse.success(position);
    }

    @Operation(summary = "更新岗位")
    @PutMapping("/{id}")
    @RequirePermission("USER_CENTER_POSITION_EDIT")
    public ApiResponse<PositionDO> update(@PathVariable Long id, @RequestBody PositionDO position) {
        PositionDO existing = positionMapper.selectById(id);
        if (existing == null) {
            return ApiResponse.fail("404", "岗位不存在");
        }
        position.setId(id);
        position.setGmtModified(LocalDateTime.now());
        positionMapper.updateById(position);
        return ApiResponse.success(positionMapper.selectById(id));
    }

    @Operation(summary = "删除岗位")
    @DeleteMapping("/{id}")
    @RequirePermission("USER_CENTER_POSITION_DELETE")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        positionMapper.deleteById(id);
        return ApiResponse.success();
    }
}
